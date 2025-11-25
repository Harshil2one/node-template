import { Request, Response, RequestHandler, NextFunction } from "express";
import { HTTP_STATUS } from "../enums/status.enum";
import { APIResponse } from "../helpers/apiResponse";
import db from "../config/db.config";
import { IBooking } from "../models/restaurants.model";
import { IUser } from "../models/auth.model";

const getBookings: RequestHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const { userId } = await request.params;
  try {
    let bookings: any = [];
    const [user_bookings] = (await db.query(
      "SELECT * FROM bookings WHERE user_id = ? ORDER BY id DESC",
      userId
    )) as any;

    for (let i = 0; i < user_bookings?.length; i++) {
      const [[restaurant]] = (await db.query(
        "SELECT * FROM restaurants WHERE id = ?",
        user_bookings?.[i]?.restaurant_id
      )) as any;

      const [[slots]] = (await db.query(
        "SELECT * FROM time_slots WHERE id = ?",
        user_bookings?.[i]?.time
      )) as any;

      bookings.push({ ...user_bookings?.[i], restaurant, slots });
    }

    APIResponse(
      response,
      true,
      HTTP_STATUS.SUCCESS,
      "Bookings fetched successfully!",
      bookings
    );
  } catch (error: unknown) {
    if (error) {
      APIResponse(response, false, HTTP_STATUS.BAD_REQUEST, error as string);
    } else {
      return next(error);
    }
  }
};

const getBookingsByRestaurantId: RequestHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const { restaurantId } = await request.params;
  try {
    let bookings: any = [];
    const [user_bookings] = (await db.query(
      "SELECT * FROM bookings WHERE restaurant_id = ? ORDER BY id DESC",
      restaurantId
    )) as any;

    const [[restaurant]] = (await db.query(
      "SELECT * FROM restaurants WHERE id = ?",
      restaurantId
    )) as any;

    for (let i = 0; i < user_bookings?.length; i++) {
      const [[slots]] = (await db.query(
        "SELECT * FROM time_slots WHERE id = ?",
        user_bookings?.[i]?.time
      )) as any;

      const [[user]] = (await db.query(
        "SELECT * FROM users WHERE id = ?",
        user_bookings?.[i]?.user_id
      )) as unknown as [[IUser]];

      bookings.push({
        ...user_bookings?.[i],
        restaurant,
        slots,
        user: {
          name: user.name,
          email: user.email,
          image: user.image,
          contact: user.contact,
        },
      });
    }

    APIResponse(
      response,
      true,
      HTTP_STATUS.SUCCESS,
      "Bookings fetched successfully!",
      bookings
    );
  } catch (error: unknown) {
    if (error) {
      APIResponse(response, false, HTTP_STATUS.BAD_REQUEST, error as string);
    } else {
      return next(error);
    }
  }
};

const getTimeSlotsByRestaurantId: RequestHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const { restaurantId } = await request.params;
  try {
    const [slots] = await db.query("SELECT * FROM time_slots");

    const [bookings] = (await db.query(
      "SELECT * FROM bookings WHERE restaurant_id = ?",
      restaurantId
    )) as any;

    APIResponse(
      response,
      true,
      HTTP_STATUS.SUCCESS,
      "Time slots fetched successfully!",
      { slots, bookedSlots: bookings?.map((booking: IBooking) => booking.time) }
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
  getBookings,
  getBookingsByRestaurantId,
  getTimeSlotsByRestaurantId,
};
