import { Request, Response, RequestHandler, NextFunction } from "express";
import { HTTP_STATUS } from "../enums/status.enum";
import { APIResponse } from "../helpers/apiResponse";
import db from "../config/db.config";
import { IRider } from "../models/rider.model";
import { ORDER_STATUS } from "../enums/restaurants.enum";
import { IOrder } from "../models/orders.model";
import { IUser } from "../models/auth.model";

const getAllRequests: RequestHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const [requests] = (await db.query("SELECT * FROM riders")) as unknown as [
      IRider
    ];

    if (!requests) {
      return APIResponse(
        response,
        false,
        HTTP_STATUS.BAD_REQUEST,
        "No rider requests available!"
      );
    }

    APIResponse(
      response,
      true,
      HTTP_STATUS.SUCCESS,
      "Rider requests fetched successfully!",
      requests
    );
  } catch (error: unknown) {
    if (error) {
      APIResponse(response, false, HTTP_STATUS.BAD_REQUEST, error as string);
    } else {
      return next(error);
    }
  }
};

const getDashboardData: RequestHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const { userId } = await request.params;
  try {
    const [orders] = (await db.query(
      "SELECT * FROM orders WHERE pickup_by = ? AND order_status = ?",
      [userId, ORDER_STATUS.DELIVERED]
    )) as any;

    if (!orders) {
      return APIResponse(
        response,
        false,
        HTTP_STATUS.BAD_REQUEST,
        "No orders delivered yet!"
      );
    }

    const getDashboardData = async () => {
      const totalRevenue = orders.reduce(
        (sum: number, o: IOrder) => sum + Number(o.delivery_fee),
        0
      );
      const totalOrders = orders.length;
      const averageOrderValue =
        totalOrders > 0 ? totalRevenue / totalOrders : 0;

      const ordersGroupedByDate = orders.reduce((acc: any, o: IOrder) => {
        const date = new Date(o.created_at * 1000).toISOString().split("T")[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const revenueGroupedByDate = orders.reduce((acc: any, o: IOrder) => {
        const date = new Date(o.created_at * 1000).toISOString().split("T")[0];
        acc[date] = (acc[date] || 0) + Number(o.delivery_fee);
        return acc;
      }, {} as Record<string, number>);

      const allFoodIds = [
        ...new Set(orders.flatMap((order: IOrder) => order.food)),
      ];
      const allUserIds = [...new Set(orders.map((o: IOrder) => o.user_id))];

      const [foods] = (await db.query("SELECT * FROM foods WHERE id IN (?)", [
        allFoodIds,
      ])) as any;

      const [users] = (await db.query("SELECT * FROM users WHERE id IN (?)", [
        allUserIds,
      ])) as any;

      const foodMap = new Map(foods.map((food: any) => [food.id, food]));
      const userMap = new Map(users.map((u: IUser) => [u.id, u]));

      const enrichedOrders = orders.map((order: IOrder) => {
        const foodCountMap: Record<number, number> = {};
        order.food.forEach((id: number) => {
          foodCountMap[id] = (foodCountMap[id] || 0) + 1;
        });

        const uniqueFoods = Object.entries(foodCountMap)
          .map(([id, count]) => {
            const food = foodMap.get(Number(id));
            if (!food) return null;
            return { ...food, count };
          })
          .filter(Boolean);

        const user = userMap.get(order.user_id) as IUser;

        return {
          ...order,
          food: uniqueFoods,
          user: user
            ? {
                name: user.name,
                email: user.email,
                image: user.image,
                contact: user.contact,
              }
            : null,
        };
      });

      const recentOrders = enrichedOrders
        .sort((a: IOrder, b: IOrder) => b.created_at - a.created_at)
        .slice(0, 5);

      const now = Date.now() / 1000;
      const sevenDaysAgo = now - 7 * 24 * 60 * 60;
      const fourteenDaysAgo = now - 14 * 24 * 60 * 60;

      const lastWeekRevenue = orders
        .filter((o: IOrder) => o.created_at >= sevenDaysAgo)
        .reduce((sum: number, o: IOrder) => sum + Number(o.amount), 0);

      const prevWeekRevenue = orders
        .filter(
          (o: IOrder) =>
            o.created_at >= fourteenDaysAgo && o.created_at < sevenDaysAgo
        )
        .reduce((sum: number, o: IOrder) => sum + Number(o.amount), 0);

      const revenueGrowth =
        prevWeekRevenue === 0
          ? 100
          : ((lastWeekRevenue - prevWeekRevenue) / prevWeekRevenue) * 100;

      return {
        totalRevenue,
        totalOrders,
        averageOrderValue,
        orders: ordersGroupedByDate,
        dailyRevenue: revenueGroupedByDate,
        recentOrders,
        revenueGrowth: Number(revenueGrowth.toFixed(2)),
      };
    };

    const dashboardData = await getDashboardData();

    APIResponse(
      response,
      true,
      HTTP_STATUS.SUCCESS,
      "Dashboard details fetched successfully!",
      dashboardData
    );
  } catch (error: unknown) {
    if (error) {
      APIResponse(response, false, HTTP_STATUS.BAD_REQUEST, error as string);
    } else {
      return next(error);
    }
  }
};

const registerRider: RequestHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const { name, city, contact } = await request.body;
  try {
    const [rider] = (await db.query(
      "INSERT INTO riders (name, city, contact) VALUES (?, ?, ?)",
      [name, city, contact]
    )) as unknown as [IRider];

    if (rider.affectedRows === 0) {
      APIResponse(
        response,
        false,
        HTTP_STATUS.INTERNAL_SERVER,
        "Something wrong happened!"
      );
      return;
    }

    const client = require("twilio")(
      process.env.TWILIO_SID,
      process.env.TWILIO_TOKEN
    );
    const body =
      "We've received your Bigbite rider request. Our team will go through it. Once they confirm you'll receive confirmation from our side. It may take 1-2 working days to proceed. Please contact us if you do not receive updates!";

    client.messages.create({
      body,
      messagingServiceSid: process.env.TWILIO_MESSAGE_SID,
      to: "+91" + rider.contact,
    });
    APIResponse(response, true, HTTP_STATUS.SUCCESS, "Rider request sent!");
  } catch (error: unknown) {
    if (error) {
      APIResponse(response, false, HTTP_STATUS.BAD_REQUEST, error as string);
    } else {
      return next(error);
    }
  }
};

const updateRiderRequest: RequestHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const { id } = request.params;
  const { status } = await request.body;
  try {
    const [[existingRequest]] = (await db.query(
      "SELECT * FROM riders WHERE id = ?",
      [id]
    )) as unknown as [[IRider]];

    if (!existingRequest) {
      APIResponse(
        response,
        false,
        HTTP_STATUS.INTERNAL_SERVER,
        "Rider request not found!"
      );
      return;
    }

    const [request] = (await db.query(
      "UPDATE riders SET status = ? WHERE id = ?",
      [status, id]
    )) as unknown as [IRider];

    if (request.affectedRows === 0) {
      APIResponse(
        response,
        false,
        HTTP_STATUS.INTERNAL_SERVER,
        "Something wrong happened!"
      );
      return;
    }

    const client = require("twilio")(
      process.env.TWILIO_SID,
      process.env.TWILIO_TOKEN
    );
    const body =
      status === "approved"
        ? "Congratulations! Your Bigbite rider request has been approved. You got further instructions from our team soon. Please provide your residential address when our executive calls you so we can provide you startup kit. THANK YOU!"
        : "We're sorry to let you know that you are not able to work with us as of now. We will be in touch incase of further riders are needed. THANK YOU!";

    client.messages
      .create({
        body,
        messagingServiceSid: process.env.TWILIO_MESSAGE_SID,
        to: "+91" + existingRequest.contact,
      })
      .then((message: any) =>
        APIResponse(
          response,
          true,
          HTTP_STATUS.SUCCESS,
          `Request has been ${status}!`,
          { code: message.sid }
        )
      );
  } catch (error: unknown) {
    if (error) {
      APIResponse(response, false, HTTP_STATUS.BAD_REQUEST, error as string);
    } else {
      return next(error);
    }
  }
};

export default {
  getAllRequests,
  getDashboardData,
  registerRider,
  updateRiderRequest,
};
