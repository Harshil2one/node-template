import { Request, Response, RequestHandler, NextFunction } from "express";
import { APIResponse } from "../helpers/apiResponse";
import { HTTP_STATUS } from "../enums/status.enum";
import db from "../config/db.config";
import { IOrder } from "../models/orders.model";
import { IUser } from "../models/auth.model";
import { IFood, IRestaurant } from "../models/restaurants.model";
import { ORDER_STATUS } from "../enums/restaurants.enum";
import { getSocket } from "../config/socket.config";
import { emitToUser } from "../helpers/socket";

const nodemailer = require("nodemailer");
const Razorpay = require("razorpay");

const getAllOrders: RequestHandler = async (
  _request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const [orders] = (await db.query("SELECT * FROM orders")) as any;

    if (!orders) {
      return APIResponse(
        response,
        false,
        HTTP_STATUS.SUCCESS,
        "No orders placed yet!"
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
      "Orders fetched successfully!",
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

const getOrdersByUser: RequestHandler = async (
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

    const [orders] = (await db.query(
      "SELECT * FROM orders WHERE user_id = ? AND (order_status != ? ) ORDER BY id DESC",
      [userId, ORDER_STATUS.ORDER_FAILED]
    )) as any;

    if (orders?.length === 0) {
      return APIResponse(
        response,
        false,
        HTTP_STATUS.NOT_FOUND,
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

    const enrichedOrders = orders.map((order: IOrder) => {
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
    });

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

const getOrderByOrderId: RequestHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const { orderId } = request.params;
    const [[orders]] = (await db.query(
      "SELECT * FROM orders WHERE order_id = ?",
      [orderId]
    )) as any;

    if (!orders) {
      return APIResponse(
        response,
        false,
        HTTP_STATUS.NOT_FOUND,
        "No order found!"
      );
    }

    const allFoodIds = [...new Set(orders.food)];

    const [foods] = (await db.query("SELECT * FROM foods WHERE id IN (?)", [
      allFoodIds,
    ])) as any;

    const [restaurants] = (await db.query(
      "SELECT * FROM restaurants WHERE id IN (?)",
      [orders.restaurant]
    )) as any;

    const [users] = (await db.query("SELECT * from users")) as any;

    const foodIds = orders.food;
    const orderFoods = foods.filter((f: IFood) => foodIds.includes(f.id));
    const user = users.find((u: IUser) => u.id === orders.pickup_by) as IUser;

    const enrichedOrder = {
      ...orders,
      food: orderFoods.map((f: IFood) => ({
        ...f,
        count: foodIds.filter((id: number) => id === f.id).length,
      })),
      restaurant: restaurants.find(
        (r: IRestaurant) => r.id === orders.restaurant
      ),
      pickup_by: {
        id: user?.id,
        name: user?.name,
      },
    };

    APIResponse(
      response,
      true,
      HTTP_STATUS.SUCCESS,
      "Order details fetched successfully!",
      enrichedOrder
    );
  } catch (error: unknown) {
    if (error) {
      APIResponse(response, false, HTTP_STATUS.BAD_REQUEST, error as string);
    } else {
      return next(error);
    }
  }
};

const getOrdersByRestaurant: RequestHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const { restaurantId } = request.params;

    const [orders] = (await db.query(
      "SELECT * FROM orders WHERE restaurant = ? AND payment_status = ? AND (order_status = ? OR order_status = ? OR order_status = ?) ORDER BY id DESC",
      [
        restaurantId,
        "paid",
        ORDER_STATUS.ORDER_PLACED,
        ORDER_STATUS.PREPARING,
        ORDER_STATUS.READY_FOR_PICKUP,
      ]
    )) as any;

    if (!orders) {
      return APIResponse(
        response,
        false,
        HTTP_STATUS.NOT_FOUND,
        "No order requests are placed!"
      );
    }

    const allFoodIds = [
      ...new Set(orders.flatMap((order: IOrder) => order.food)),
    ];

    const [foods] = (await db.query("SELECT * FROM foods WHERE id IN (?)", [
      allFoodIds,
    ])) as any;

    const [restaurants] = (await db.query(
      "SELECT * FROM restaurants WHERE id = ?",
      restaurantId
    )) as any;

    const enrichedOrders = orders.map((order: IOrder) => {
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
    });

    APIResponse(
      response,
      true,
      HTTP_STATUS.SUCCESS,
      "Order requests fetched successfully!",
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

const getRideRequests: RequestHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const [orders] = (await db.query(
      "SELECT * FROM orders WHERE payment_status = ? AND (order_status = ? OR order_status = ?) ORDER BY id DESC",
      ["paid", ORDER_STATUS.OUT_FOR_DELIVERY, ORDER_STATUS.DELIVERED]
    )) as any;

    if (!orders) {
      return APIResponse(
        response,
        false,
        HTTP_STATUS.NOT_FOUND,
        "No order pickups are there!"
      );
    }

    const allFoodIds = [
      ...new Set(orders.flatMap((order: IOrder) => order.food)),
    ];

    const [foods] = (await db.query("SELECT * FROM foods WHERE id IN (?)", [
      allFoodIds,
    ])) as any;

    const [restaurants] = (await db.query("SELECT * FROM restaurants")) as any;

    const [users] = (await db.query("SELECT * from users")) as any;

    const enrichedOrders = orders.map((order: IOrder) => {
      const foodIds = order.food;
      const orderFoods = foods.filter((f: IFood) => foodIds.includes(f.id));
      const food = orderFoods.map((f: IFood) => ({
        ...f,
        count: foodIds.filter((id: number) => id === f.id).length,
      }));
      const restaurant = restaurants.find(
        (r: IRestaurant) => r.id === order.restaurant
      );
      const user = users.find((u: IUser) => u.id === order.pickup_by) as IUser;

      return {
        ...order,
        food,
        restaurant,
        pickup_by: {
          id: user?.id,
          name: user?.name,
        },
      };
    });

    APIResponse(
      response,
      true,
      HTTP_STATUS.SUCCESS,
      "Order pickups fetched successfully!",
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

const updateOrderStatus: RequestHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const { orderId, status, pickupBy } = await request.body;
  try {
    let order = {} as IOrder;
    if (pickupBy && status !== ORDER_STATUS.OUT_FOR_DELIVERY) {
      const [updatedOrder] = (await db.query(
        "UPDATE orders SET order_status = ?, delivered_time = ? WHERE id = ?",
        [status, Date.now() / 1000, orderId]
      )) as unknown as [IOrder];
      order = updatedOrder;
    } else if (pickupBy) {
      const [updatedOrder] = (await db.query(
        "UPDATE orders SET pickup_by = ?, pickup_time = ? WHERE id = ?",
        [pickupBy, Date.now() / 1000, orderId]
      )) as unknown as [IOrder];
      order = updatedOrder;
    } else {
      const [updatedOrder] = (await db.query(
        "UPDATE orders SET order_status = ? WHERE id = ?",
        [status, orderId]
      )) as unknown as [IOrder];
      order = updatedOrder;
    }

    if (order.affectedRows === 0) {
      APIResponse(
        response,
        false,
        HTTP_STATUS.INTERNAL_SERVER,
        "Something wrong happened!"
      );
      return;
    }

    APIResponse(
      response,
      true,
      HTTP_STATUS.SUCCESS,
      "Order status updated successfully!"
    );
  } catch (error: any) {
    if (error) {
      APIResponse(response, false, HTTP_STATUS.BAD_REQUEST, error as string);
    } else {
      return next(error);
    }
  }
};

const updateOrderRatings: RequestHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const { orderId } = await request.params;
  const { ratings, ratingsText } = await request.body;
  try {
    const [order] = (await db.query(
      "UPDATE orders SET ratings = ?, ratingsText = ? WHERE id = ?",
      [ratings, ratingsText, orderId]
    )) as unknown as [IOrder];

    if (order.affectedRows === 0) {
      APIResponse(
        response,
        false,
        HTTP_STATUS.INTERNAL_SERVER,
        "Something wrong happened!"
      );
      return;
    }

    APIResponse(
      response,
      true,
      HTTP_STATUS.SUCCESS,
      "Thank you for your feedback."
    );
  } catch (error: any) {
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
  const { io } = getSocket();
  try {
    const { userId, amount, orderInfo } = request.body;
    const { email, restaurant, food } = orderInfo;

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
      "INSERT INTO orders (user_id, order_id, receipt, amount, restaurant, food, payment_status, payment_id, delivery_fee, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        userId,
        id,
        receipt,
        amount,
        restaurant,
        JSON.stringify(food),
        status,
        "",
        amount * 0.08,
        created_at,
      ]
    )) as unknown as [IOrder];
    const testAccount = await nodemailer.createTestAccount();

    const transporter = nodemailer.createTransport({
      // service: "gmail",
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        // user: "bigbite.0110@gmail.com",
        // pass: "kseb rvrh avds cuib",
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    if (orderEntry?.affectedRows && orderEntry?.affectedRows > 0)
      (async () => {
        const info = await transporter.sendMail({
          from: '"Big Bite" <bigbite.0110@gmail.com>',
          to: email,
          subject: "Order Placed - Confirmation",
          html: `
  <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; text-align: center;">
    <div style="margin: auto; background: white; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); overflow: hidden;">
      <div style="background-color: #ff4b2b; padding: 20px 0;">
        <h2 style="color: white; margin: 0;">Bigbite</h2>
      </div>

      <div style="padding: 30px;">
        <h3 style="color: #333;">Email Verification</h3>
        <p style="color: #555; font-size: 15px; line-height: 1.6;">
          Your order is placed with <b>Big Bite</b>. Below is the details about your order.
        </p>

        <div style="margin: 25px 0;">
          <span style="font-size: 32px; letter-spacing: 8px; color: #ff4b2b; font-weight: bold;">ORDER ID : ${id}</span>
        </div>

        <p style="color: #777; font-size: 14px;">
          Use this ID to verify your order and help delivery partners to support customers by serving correct orders.
        </p>

        <div style="margin-top: 30px;">
          Thank you.
        </div>
      </div>

      <div style="background-color: #fafafa; padding: 15px; font-size: 12px; color: #999;">
        <p>© ${new Date().getFullYear()} Bigbite. All rights reserved.</p>
      </div>
    </div>
  </div>
  `,
        });

        const [notification] = (await db.query(
          "INSERT INTO notifications (message, receiver, link, created_at) VALUES (?, ?, ?, ?)",
          [`Your order is placed at Bigbite.`, userId, `/order-placed/${id}`, Date.now() / 1000]
        )) as unknown as [IUser];

        emitToUser(io, userId, "receive_notification", {
          data: notification,
        });

        APIResponse(
          response,
          true,
          HTTP_STATUS.SUCCESS,
          "Order placed successfully!",
          {
            order_id: id,
            amount,
            preview: nodemailer.getTestMessageUrl(info),
          }
        );
      })();
  } catch (error: any) {
    if (error) {
      APIResponse(response, false, HTTP_STATUS.BAD_REQUEST, error as string);
    } else {
      return next(error);
    }
  }
};

const cancelOrder: RequestHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const { id } = request.params;
  try {
    const rzp = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const refund = await rzp.payments.refund(request.body.paymentId, {
      amount: Number(request.body.amount) * 100,
      speed: "optimum",
    });

    if (refund.status === "processed") {
      const [order] = (await db.query(
        "UPDATE orders SET order_status = ? WHERE id = ?",
        [5, id]
      )) as unknown as [IOrder];

      if (order.affectedRows === 0) {
        APIResponse(
          response,
          false,
          HTTP_STATUS.INTERNAL_SERVER,
          "Something wrong happened!"
        );
        return;
      }

      APIResponse(
        response,
        true,
        HTTP_STATUS.SUCCESS,
        "Order cancelled successfully!",
        { time: new Date() }
      );
    }
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
      "UPDATE orders SET payment_status = ?, payment_id = ? WHERE order_id = ?",
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
      "UPDATE orders SET payment_status = ?, payment_id = ?, order_status = ? WHERE order_id = ?",
      ["failed", payment_id, ORDER_STATUS.ORDER_FAILED, orderId]
    )) as unknown as [IOrder];
    if (updateOrder?.affectedRows && updateOrder?.affectedRows > 0)
      APIResponse(response, true, HTTP_STATUS.SUCCESS, "Payment Cancelled!");
  } else {
    APIResponse(response, true, HTTP_STATUS.SUCCESS, "Something went wrong");
    return next("Something went wrong");
  }
};

export default {
  getAllOrders,
  getOrdersByUser,
  getOrderByOrderId,
  getOrdersByRestaurant,
  getRideRequests,
  updateOrderStatus,
  updateOrderRatings,
  createOrder,
  cancelOrder,
  capturePayment,
  capturePaymentFailure,
};
