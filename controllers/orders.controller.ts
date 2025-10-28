import { Request, Response, RequestHandler, NextFunction } from "express";
import { APIResponse } from "../helpers/apiResponse";
import { HTTP_STATUS } from "../enums/status.enum";
import db from "../config/db.config";
import { IOrder } from "../models/orders.model";
import { IUser } from "../models/auth.model";
import { IFood, IRestaurant } from "../models/restaurants.model";

const Razorpay = require("razorpay");

const getAllOrders: RequestHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const { userId } = request.params;

    const [[user]] = (await db.query("SELECT * FROM users WHERE id = ?", [
      userId,
    ])) as unknown as [[IUser]];

    if (!user) {
      return APIResponse(
        response,
        false,
        HTTP_STATUS.BAD_REQUEST,
        "Account is deleted!"
      );
    }

    const [orders] = (await db.query("SELECT * FROM orders WHERE user_id = ?", [
      userId,
    ])) as any;

    if (!orders) {
      return APIResponse(
        response,
        false,
        HTTP_STATUS.SUCCESS,
        "User has no order history!"
      );
    }

    const allFoodIds = [
      ...new Set(orders.flatMap((order: IOrder) => order.food)),
    ];

    const [foods] = (await db.query("SELECT * FROM foods WHERE id IN (?)", [
      allFoodIds,
    ])) as any;

    const [restaurants] = (await db.query(
      "SELECT * FROM restaurants WHERE id IN (?)",
      [orders.flatMap((order: IOrder) => order.restaurant)]
    )) as any;

    const enrichedOrders = orders
      .map((order: IOrder) => {
        const foodIds = order.food;
        const orderFoods = foods.filter((f: IFood) => foodIds.includes(f.id));
        const food = orderFoods.map((f: IFood) => ({
          ...f,
          count: foodIds.filter((id: number) => id === f.id).length,
        }));
        const restaurant = restaurants.find(
          (r: IRestaurant) => r.id === order.restaurant
        );

        return { ...order, food, restaurant };
      })
      .reverse();

    APIResponse(
      response,
      true,
      HTTP_STATUS.SUCCESS,
      "Order history fetched successfully!",
      enrichedOrders
    );
  } catch (error: unknown) {
    if (error) {
      APIResponse(response, false, HTTP_STATUS.BAD_REQUEST, error as string);
    } else {
      return next(error);
    }
  }
};

const createOrder: RequestHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const { userId, amount, orderInfo } = request.body;
    const { restaurant, food } = orderInfo;

    const rzp = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const data = await rzp.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });
    const { id, receipt, status, created_at } = data;
    const [orderEntry] = (await db.query(
      "INSERT INTO orders (user_id, order_id, receipt, amount, restaurant, food, status, payment_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        userId,
        id,
        receipt,
        amount,
        restaurant,
        JSON.stringify(food),
        status,
        "",
        created_at,
      ]
    )) as unknown as [IOrder];
    if (orderEntry?.affectedRows && orderEntry?.affectedRows > 0)
      APIResponse(
        response,
        true,
        HTTP_STATUS.SUCCESS,
        "Order placed successfully!",
        {
          order_id: id,
          amount,
        }
      );
  } catch (error: any) {
    if (error) {
      APIResponse(response, false, HTTP_STATUS.BAD_REQUEST, error as string);
    } else {
      return next(error);
    }
  }
};

const capturePayment: RequestHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const { order_id, payment_id } = request.body;

  if (
    process.env.RAZORPAY_KEY_SECRET === request.headers["x-razorpay-signature"]
  ) {
    const [updateOrder] = (await db.query(
      "UPDATE orders SET status = ?, payment_id = ? WHERE order_id = ?",
      ["paid", payment_id, order_id]
    )) as unknown as [IOrder];
    if (updateOrder?.affectedRows && updateOrder?.affectedRows > 0)
      APIResponse(response, true, HTTP_STATUS.SUCCESS, "Payment received!");
  } else {
    APIResponse(response, true, HTTP_STATUS.SUCCESS, "Something went wrong");
    return next("Something went wrong");
  }
};

const capturePaymentFailure: RequestHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const { orderId } = request.params;
  const { payment_id } = request.body;
  if (
    process.env.RAZORPAY_KEY_SECRET === request.headers["x-razorpay-signature"]
  ) {
    const [updateOrder] = (await db.query(
      "UPDATE orders SET status = ?, payment_id = ? WHERE order_id = ?",
      ["failed", payment_id, orderId]
    )) as unknown as [IOrder];
    if (updateOrder?.affectedRows && updateOrder?.affectedRows > 0)
      APIResponse(response, true, HTTP_STATUS.SUCCESS, "Payment Cancelled!");
  } else {
    APIResponse(response, true, HTTP_STATUS.SUCCESS, "Something went wrong");
    return next("Something went wrong");
  }
};

const refund: RequestHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const options = {
      payment_id: request.body.paymentId,
      amount: request.body.amount,
    };

    const razorpayResponse = await Razorpay.refund(options);

    response.send("Successfully refunded");
  } catch (error) {
    if (error) {
      APIResponse(response, false, HTTP_STATUS.BAD_REQUEST, error as string);
    } else {
      return next(error);
    }
  }
};

export default {
  getAllOrders,
  createOrder,
  capturePayment,
  capturePaymentFailure,
  refund,
};
