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
import { INotification } from "../models/notifications.model";
import { USER_ROLE } from "../enums/auth.enum";
import { getUser, getUsers, sendFCM } from "../helpers/utils";

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
        image: user?.image,
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
  const { filter } = await request.query;
  try {
    let orders: any = [];
    if (filter === "all") {
      const [data] = (await db.query(
        "SELECT * FROM orders WHERE payment_status = ? AND (order_status = ? OR order_status = ?) ORDER BY order_status ASC",
        ["paid", ORDER_STATUS.OUT_FOR_DELIVERY, ORDER_STATUS.DELIVERED]
      )) as any;
      orders = data;
    } else {
      const [data] = (await db.query(
        "SELECT * FROM orders WHERE payment_status = ? AND pickup_by = ? AND (order_status = ? OR order_status = ?) ORDER BY order_status ASC",
        ["paid", filter, ORDER_STATUS.OUT_FOR_DELIVERY, ORDER_STATUS.DELIVERED]
      )) as any;
      orders = data;
    }

    if (orders?.length === 0) {
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
          image: user?.image,
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
  const { io } = getSocket();

  try {
    let order = {} as IOrder;
    if (pickupBy && status !== ORDER_STATUS.OUT_FOR_DELIVERY) {
      const [updatedOrder] = (await db.query(
        "UPDATE orders SET order_status = ?, delivered_time = ? WHERE id = ?",
        [status, Date.now() / 1000, orderId]
      )) as unknown as [IOrder];
      order = updatedOrder;

      const [[data]] = (await db.query("SELECT * FROM orders WHERE id = ?", [
        orderId,
      ])) as unknown as [[IOrder]];

      const [foods] = (await db.query("SELECT * FROM foods WHERE id IN (?)", [
        data.food,
      ])) as any;

      const [[restaurant]] = (await db.query(
        "SELECT * FROM restaurants WHERE id = ?",
        data.restaurant
      )) as any;

      const foodIds = data.food;
      const orderFoods = foods.filter((f: IFood) => foodIds.includes(f.id));
      const food = orderFoods.map((f: IFood) => ({
        ...f,
        count: foodIds.filter((id: number) => id === f.id).length,
      }));

      const enrichedOrder = {
        ...data,
        food,
        restaurant,
      };

      const users = await getUsers(USER_ROLE.USER, enrichedOrder.user_id);
      const notification = {
        message: `Recent order: #${enrichedOrder.order_id} is delivered.`,
        receiver: JSON.stringify(users),
        link: `/order-placed/${enrichedOrder.order_id}`,
        created_at: Date.now() / 1000,
      };
      emitToUser(io, users, "update_order_status", enrichedOrder, notification);

      const user = await getUser(enrichedOrder.user_id);
      if (user.token)
        sendFCM(
          user.token,
          `Order delivered`,
          `Order: ${enrichedOrder.order_id} has been delivered.`,
          `/order-placed/${enrichedOrder.order_id}`
        );

      const restOfRiders = await getUsers(USER_ROLE.RIDER, pickupBy, "no");
      const pickupRider = await getUser(pickupBy);
      emitToUser(io, restOfRiders, "picked_up", {
        ...data,
        pickup_by: {
          id: pickupRider?.id,
          name: pickupRider?.name,
          image: pickupRider?.image,
        },
      });
    } else if (pickupBy) {
      const [[data0]] = (await db.query("SELECT * FROM orders WHERE id = ?", [
        orderId,
      ])) as unknown as [[IOrder]];
      if (!data0?.pickup_by) {
        const [updatedOrder] = (await db.query(
          "UPDATE orders SET pickup_by = ?, pickup_time = ? WHERE id = ?",
          [pickupBy, Date.now() / 1000, orderId]
        )) as unknown as [IOrder];
        order = updatedOrder;
        const [[data]] = (await db.query("SELECT * FROM orders WHERE id = ?", [
          orderId,
        ])) as unknown as [[IOrder]];
        const restOfRiders = await getUsers(USER_ROLE.RIDER, pickupBy, "no");
        const pickupRider = await getUser(pickupBy);
        emitToUser(io, restOfRiders, "picked_up", {
          ...data,
          pickup_by: {
            id: pickupRider?.id,
            name: pickupRider?.name,
            image: pickupRider?.image,
          },
        });
      } else {
        return APIResponse(
          response,
          false,
          HTTP_STATUS.BAD_REQUEST,
          "Already picked up!"
        );
      }
    } else {
      const [updatedOrder] = (await db.query(
        "UPDATE orders SET order_status = ? WHERE id = ?",
        [status, orderId]
      )) as unknown as [IOrder];
      order = updatedOrder;

      if (order.affectedRows === 0) {
        APIResponse(
          response,
          false,
          HTTP_STATUS.INTERNAL_SERVER,
          "Something wrong happened!"
        );
        return;
      }

      const [[data]] = (await db.query("SELECT * FROM orders WHERE id = ?", [
        orderId,
      ])) as unknown as [[IOrder]];

      const [foods] = (await db.query("SELECT * FROM foods WHERE id IN (?)", [
        data.food,
      ])) as any;

      const [[restaurant]] = (await db.query(
        "SELECT * FROM restaurants WHERE id = ?",
        data.restaurant
      )) as any;

      const foodIds = data.food;
      const orderFoods = foods.filter((f: IFood) => foodIds.includes(f.id));
      const food = orderFoods.map((f: IFood) => ({
        ...f,
        count: foodIds.filter((id: number) => id === f.id).length,
      }));

      const enrichedOrder = {
        ...data,
        food,
        restaurant,
      };

      if (status === ORDER_STATUS.OUT_FOR_DELIVERY) {
        const riders = await getUsers(USER_ROLE.RIDER);
        const notification = {
          message: `New order pickup request from ${enrichedOrder.restaurant.name}.`,
          receiver: JSON.stringify(riders),
          link: `/riders/rides`,
          created_at: Date.now() / 1000,
        };

        (await db.query(
          "INSERT INTO notifications (message, receiver, link, created_at) VALUES (?, ?, ?, ?)",
          [
            notification.message,
            notification.receiver,
            notification.link,
            notification.created_at,
          ]
        )) as unknown as [INotification];

        emitToUser(io, riders, "receive_pickup", enrichedOrder, notification);
        const user = await getUser(enrichedOrder.user_id);
        if (user.token)
          sendFCM(
            user.token,
            `New pickup`,
            `Restaurant: ${enrichedOrder.restaurant.name}`,
            `/riders/rides`
          );
      }
      const users = await getUsers(USER_ROLE.USER, enrichedOrder.user_id);
      const notification = {
        message: `Recent order: #${enrichedOrder.order_id} is ${
          enrichedOrder.order_status === ORDER_STATUS.ORDER_PLACED
            ? "placed"
            : enrichedOrder.order_status === ORDER_STATUS.PREPARING
            ? "preparing"
            : enrichedOrder.order_status === ORDER_STATUS.READY_FOR_PICKUP
            ? "ready to be picked up"
            : "on the way"
        }.`,
        receiver: JSON.stringify(users),
        link: `/order-placed/${enrichedOrder.order_id}`,
        created_at: Date.now() / 1000,
      };
      emitToUser(io, users, "update_order_status", enrichedOrder, notification);

      const user = await getUser(enrichedOrder.user_id);
      if (user.token)
        sendFCM(
          user.token,
          `Order update`,
          `order: #${enrichedOrder.order_id} has been ${
            enrichedOrder.order_status === ORDER_STATUS.ORDER_PLACED
              ? "placed"
              : enrichedOrder.order_status === ORDER_STATUS.PREPARING
              ? "preparing"
              : enrichedOrder.order_status === ORDER_STATUS.READY_FOR_PICKUP
              ? "ready to be picked up"
              : "on the way"
          }.`,
          `/order-placed/${enrichedOrder.order_id}`
        );
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

    const [[restaurantDetails]] = (await db.query(
      "SELECT * FROM restaurants WHERE id = ?",
      [restaurant]
    )) as unknown as [[IRestaurant]];

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
          Your order is placed with <b>Big Bite</b>. You ordered from ${
            restaurantDetails?.name
          } Below is the details about your order.
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
  const { io } = getSocket();
  try {
    const rzp = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const refund =
      request.body.amount > 0
        ? await rzp.payments.refund(request.body.paymentId, {
            amount: Number(request.body.amount) * 100,
            speed: "optimum",
          })
        : { status: "processed" };

    if (refund.status === "processed") {
      const [order] = (await db.query(
        "UPDATE orders SET order_status = ? WHERE id = ?",
        [ORDER_STATUS.CANCELLED, id]
      )) as unknown as [IOrder];

      const [[orderDetails]] = (await db.query(
        "SELECT * FROM orders WHERE id = ?",
        [id]
      )) as unknown as [[IOrder]];

      const notification = {
        message: `Your order no. ${orderDetails?.order_id} is cancelled.`,
        receiver: JSON.stringify([orderDetails?.user_id]),
        link: `/order-placed/${orderDetails?.order_id}`,
        created_at: Date.now() / 1000,
      };

      (await db.query(
        "INSERT INTO notifications (message, receiver, link, created_at) VALUES (?, ?, ?, ?)",
        [
          notification.message,
          notification.receiver,
          notification.link,
          notification.created_at,
        ]
      )) as unknown as [INotification];

      emitToUser(
        io,
        orderDetails?.user_id,
        "cancel_order",
        orderDetails,
        notification
      );

      const user = await getUser(orderDetails.user_id);
      if (user.token)
        sendFCM(
          user.token,
          `Order cancellation`,
          `Your order no. ${orderDetails?.order_id} is cancelled.`,
          `/order-placed/${orderDetails?.order_id}`
        );

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
  const { io } = getSocket();

  if (
    process.env.RAZORPAY_KEY_SECRET === request.headers["x-razorpay-signature"]
  ) {
    const [updateOrder] = (await db.query(
      "UPDATE orders SET payment_status = ?, payment_id = ? WHERE order_id = ?",
      ["paid", payment_id, order_id]
    )) as unknown as [IOrder];
    const [[orderDetails]] = (await db.query(
      "SELECT * FROM orders WHERE order_id = ?",
      order_id
    )) as unknown as [[IOrder]];
    if (updateOrder?.affectedRows && updateOrder?.affectedRows > 0) {
      const [[restaurantDetails]] = (await db.query(
        "SELECT * FROM restaurants WHERE id = ?",
        [orderDetails.restaurant]
      )) as unknown as [[IRestaurant]];

      const notification1 = {
        message: `You ordered from ${restaurantDetails?.name}.`,
        receiver: JSON.stringify([orderDetails.user_id]),
        link: `/order-placed/${order_id}`,
        created_at: Date.now() / 1000,
      };

      (await db.query(
        "INSERT INTO notifications (message, receiver, link, created_at) VALUES (?, ?, ?, ?)",
        [
          notification1.message,
          notification1.receiver,
          notification1.link,
          notification1.created_at,
        ]
      )) as unknown as [INotification];

      emitToUser(
        io,
        orderDetails.user_id,
        "place_order",
        orderDetails,
        notification1
      );

      const user1 = await getUser(orderDetails.user_id);
      if (user1.token)
        sendFCM(
          user1.token,
          `Order placed`,
          `You ordered from ${restaurantDetails?.name}.`,
          `/order-placed/${order_id}`
        );

      const [users] = (await db.query(
        "SELECT * FROM users WHERE role = ? AND id = ?",
        [USER_ROLE.OWNER, restaurantDetails?.created_by]
      )) as any;
      const notificationUsers = users?.map((user: IUser) => user?.id);

      const [foods] = (await db.query("SELECT * FROM foods WHERE id IN (?)", [
        orderDetails.food,
      ])) as any;

      const [[restaurant]] = (await db.query(
        "SELECT * FROM restaurants WHERE id = ?",
        orderDetails.restaurant
      )) as any;

      const foodIds = orderDetails.food;
      const orderFoods = foods.filter((f: IFood) => foodIds.includes(f.id));
      const food = orderFoods.map((f: IFood) => ({
        ...f,
        count: foodIds.filter((id: number) => id === f.id).length,
      }));

      const enrichedOrder = {
        ...orderDetails,
        food,
        restaurant,
      };

      const notification2 = {
        message: `New order: #${order_id} arrived at your restaurant.`,
        receiver: JSON.stringify(notificationUsers),
        link: `/order-requests`,
        created_at: Date.now() / 1000,
      };

      (await db.query(
        "INSERT INTO notifications (message, receiver, link, created_at) VALUES (?, ?, ?, ?)",
        [
          notification2.message,
          notification2.receiver,
          notification2.link,
          notification2.created_at,
        ]
      )) as unknown as [INotification];

      emitToUser(
        io,
        notificationUsers,
        "receive_order",
        enrichedOrder,
        notification2
      );

      const user2 = await getUser(notificationUsers?.[0]);
      if (user2.token)
        sendFCM(
          user2.token,
          `New order`,
          `Order: #${order_id} arrived at your restaurant.`,
          `/order-requests`
        );

      APIResponse(response, true, HTTP_STATUS.SUCCESS, "Payment received!");
    }
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
