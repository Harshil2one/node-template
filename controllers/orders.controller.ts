import { Request, Response, RequestHandler, NextFunction } from "express";
import { APIResponse } from "../helpers/apiResponse";
import { HTTP_STATUS } from "../enums/status.enum";
import db from "../config/db.config";
import { IOrder } from "../models/orders.model";
import { IUser } from "../models/auth.model";
import { IFood, IRestaurant } from "../models/restaurants.model";
import { ORDER_STATUS } from "../enums/restaurants.enum";

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

    const foodIds = orders.food;
    const orderFoods = foods.filter((f: IFood) => foodIds.includes(f.id));
    const enrichedOrder = {
      ...orders,
      food: orderFoods.map((f: IFood) => ({
        ...f,
        count: foodIds.filter((id: number) => id === f.id).length,
      })),
      restaurant: restaurants.find(
        (r: IRestaurant) => r.id === orders.restaurant
      ),
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
    if (pickupBy) {
      const [updatedOrder] = (await db.query(
        "UPDATE orders SET order_status = ?, pickup_by = ?, pickup_time = ? WHERE id = ?",
        [status, pickupBy, Date.now() / 1000, orderId]
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

const cancelOrder: RequestHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const { id } = request.params;
  try {
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
      ["failed", payment_id, 7, orderId]
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
  getOrdersByUser,
  getOrderByOrderId,
  getOrdersByRestaurant,
  getRideRequests,
  updateOrderStatus,
  createOrder,
  cancelOrder,
  capturePayment,
  capturePaymentFailure,
  refund,
};
