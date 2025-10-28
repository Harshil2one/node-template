import { Request, Response, RequestHandler, NextFunction } from "express";
import { HTTP_STATUS } from "../enums/status.enum";
import { APIResponse } from "../helpers/apiResponse";
import db from "../config/db.config";
import { IRestaurant } from "../models/restaurants.model";
const nodemailer = require("nodemailer");

const getRestaurants: RequestHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const { filter, mode, type, search } = request.query;
    const filters = filter
      ?.toString()
      ?.split(",")
      .map((item) => item.trim());
    let restaurants: any = [];
    if (mode && !filter) {
      const [rows] = await db.query(
        "SELECT * FROM restaurants WHERE mode = ?",
        [mode]
      );
      restaurants = rows;
    } else if (filters && filters?.length > 0) {
      let baseQuery = "SELECT * FROM restaurants WHERE 1=1";
      const params: any[] = [];

      if (filters?.includes("offers")) {
        baseQuery += " AND JSON_LENGTH(offers) > 0";
      }

      if (filters?.includes("veg")) {
        baseQuery += " AND type = ?";
        params.push("veg");
      }

      if (filters?.includes("non-veg")) {
        baseQuery += ` ${filters?.includes("veg") ? "OR" : "AND"} type = ?`;
        params.push("non-veg");
      }

      if (filters?.includes("ratings")) {
        baseQuery += " AND ratings > ?";
        params.push(4);
      }

      if (filters?.includes("rateLessThan300")) {
        baseQuery += " AND rate <= ?";
        params.push(filters?.includes("rate300to600") ? 600 : 300);
      }

      if (filters?.includes("rate300to600")) {
        baseQuery += filters?.includes("rateLessThan300")
          ? ""
          : ` AND (rate >= 300 AND rate <= 600)`;
      }

      if (filters?.includes("distanceWithin5km")) {
        baseQuery += " AND distance < ?";
        params.push(5);
      }

      if (filters?.includes("new")) {
        baseQuery += " AND food IS NULL";
      }

      const [rows] = await db.query(baseQuery, params);
      restaurants = rows;
    } else if (mode && filter) {
      const [rows] = await db.query(
        "SELECT * FROM restaurants WHERE mode = ? AND JSON_LENGTH(offers) > 0",
        [mode]
      );
      restaurants = rows;
    } else if (type === "restaurants" && search) {
      const [rows] = await db.query(
        "SELECT * FROM restaurants WHERE LOWER(name) LIKE LOWER(?) OR LOWER(address) LIKE LOWER(?)",
        [`%${search}%`, `%${search}%`]
      );
      restaurants = rows;
    } else if (type === "dishes" && search) {
      const [rows] = await db.query(
        `SELECT 
            f.id AS foodId,
            f.name AS foodName,
            f.price,
            f.type,
            f.image,
            f.ratings,
            r.id AS restaurantId,
            r.name AS restaurantName,
            r.time,
            r.images AS restaurantImages
          FROM foods f
          JOIN restaurants r ON JSON_CONTAINS(r.food, CAST(f.id AS JSON), '$')
          WHERE LOWER(f.name) LIKE LOWER(?) OR LOWER(f.description) LIKE LOWER(?)
        `,
        [`%${search}%`, `%${search}%`]
      );
      restaurants = rows;
    } else if (type === "collection" && search) {
      const [rows] = await db.query(
        "SELECT * FROM restaurants WHERE JSON_SEARCH(LOWER(special), 'one', LOWER(?)) IS NOT NULL",
        [`%${search}%`]
      );
      restaurants = rows;
    } else {
      const [rows] = await db.query("SELECT * FROM restaurants");
      restaurants = rows;
    }

    APIResponse(
      response,
      true,
      HTTP_STATUS.SUCCESS,
      "Restaurants fetched successfully!",
      restaurants
    );
  } catch (error: unknown) {
    if (error) {
      APIResponse(response, false, HTTP_STATUS.BAD_REQUEST, error as string);
    } else {
      return next(error);
    }
  }
};

const getRestaurantById: RequestHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const { id } = await request.params;
  try {
    const [[restaurant]] = (await db.query(
      "SELECT * FROM restaurants WHERE id = ?",
      id
    )) as unknown as [[IRestaurant]];

    APIResponse(
      response,
      true,
      HTTP_STATUS.SUCCESS,
      "Restaurant details fetched successfully!",
      restaurant
    );
  } catch (error: unknown) {
    if (error) {
      APIResponse(response, false, HTTP_STATUS.BAD_REQUEST, error as string);
    } else {
      return next(error);
    }
  }
};

const getRestaurantFood: RequestHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const { id } = await request.params;
  try {
    const [[restaurant]] = (await db.query(
      "SELECT * FROM restaurants WHERE id = ?",
      id
    )) as unknown as [[IRestaurant]];

    if (!restaurant) {
      return APIResponse(
        response,
        false,
        HTTP_STATUS.BAD_REQUEST,
        "Restaurant is not able to provide service!"
      );
    }

    const [cart] = await db.query("SELECT * FROM foods WHERE id IN (?)", [
      restaurant.food,
    ]);

    APIResponse(
      response,
      true,
      HTTP_STATUS.SUCCESS,
      "Restaurant food items fetched successfully!",
      cart
    );
  } catch (error: unknown) {
    if (error) {
      APIResponse(response, false, HTTP_STATUS.BAD_REQUEST, error as string);
    } else {
      return next(error);
    }
  }
};

const createRestaurant: RequestHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const {
    name,
    images = null,
    address,
    email,
    contact,
    time = "",
    distance = 0.0,
    ratings = 0.0,
    rate = 100,
    special = null,
    mode = "online",
    food,
    type = "veg",
    offers = null,
    bankOffers = "",
    isSpecial = 0,
  } = await request.body;
  try {
    const [restaurant] = (await db.query(
      "INSERT INTO restaurants (name, images, address, email, contact, time, distance, ratings, rate, special, mode, food, type, offers, bankOffers, isSpecial) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        name,
        JSON.stringify(images),
        address,
        email,
        contact,
        time,
        distance,
        ratings,
        rate,
        JSON.stringify(special),
        mode,
        JSON.stringify(food),
        type,
        JSON.stringify(offers),
        bankOffers,
        isSpecial,
      ]
    )) as unknown as [IRestaurant];

    if (restaurant.affectedRows === 0) {
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
      "Restaurant created successfully!",
      restaurant
    );
  } catch (error: unknown) {
    if (error) {
      APIResponse(response, false, HTTP_STATUS.BAD_REQUEST, error as string);
    } else {
      return next(error);
    }
  }
};

const bookTable: RequestHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const reqBody = await request.body;
    const { restaurantId, email } = reqBody;

    if (!restaurantId) {
      APIResponse(
        response,
        false,
        HTTP_STATUS.BAD_REQUEST,
        "Provide Restaurant Id!"
      );
      return;
    }
    const [[user]] = (await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ])) as unknown as [[IRestaurant]];
    const [[restaurant]] = (await db.query(
      "SELECT * FROM restaurants WHERE id = ?",
      [restaurantId]
    )) as unknown as [[IRestaurant]];

    if (!restaurant) {
      APIResponse(
        response,
        false,
        HTTP_STATUS.BAD_REQUEST,
        "Restaurant not found!"
      );
      return;
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "bigbite.0110@gmail.com",
        pass: "kseb rvrh avds cuib",
      },
    });

    (async () => {
      const info = await transporter.sendMail({
        from: '"Big Bite" <bigbite.0110@gmail.com>',
        to: email,
        subject: `Booking Confirmation - ${restaurant.name}`,
        html: `
  <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; text-align: center;">
    <div style="margin: auto; background: white; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); overflow: hidden;">
      <div style="background-color: #ff4b2b; padding: 20px 0;">
        <h2 style="color: white; margin: 0;">Hi, ${user.name}</h2>
      </div>

      <div style="padding: 30px;">
        <h3 style="color: #333;">Booking Confirmation Of Your Table</h3>
        <p style="color: #555; font-size: 15px; line-height: 1.6;">
          Your table booking is confirmed at <span style="color: #ff4b2b">${
            restaurant.name
          }</span> via <b>Big Bite</b>. Below is your table code:
        </p>

        <div style="margin: 25px 0;">
          <span style="font-size: 32px; color: #ff4b2b; font-weight: bold;">${Math.floor(
            Math.random() * 100 + 10
          )}</span>
        </div>

        <p style="color: #777; font-size: 14px;">
          Provide it with the respected restaurant and get special treatments. Please do not share this code with anyone.
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
      console.log(info);

      APIResponse(
        response,
        true,
        HTTP_STATUS.SUCCESS,
        "Table booked successfully!"
      );
    })();
  } catch (error: unknown) {
    if (error) {
      APIResponse(response, false, HTTP_STATUS.BAD_REQUEST, error as string);
    } else {
      return next(error);
    }
  }
};

const updateRestaurant: RequestHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const { id } = await request.params;
  const {
    name,
    images,
    address,
    email,
    contact,
    time,
    distance,
    ratings,
    rate,
    special,
    mode,
    food,
    type,
    offers,
    bankOffers,
    isSpecial,
  } = await request.body;

  try {
    const [restaurant] = (await db.query(
      "UPDATE restaurants SET name = ?, images = ?, address = ?, email = ?, contact = ?, time = ?, distance = ?, ratings = ?, rate = ?, special = ?, mode = ?, type = ?, food = ?, offers = ?, bankOffers = ?, isSpecial = ? WHERE id = ?",
      [
        name,
        JSON.stringify(images),
        address,
        email,
        contact,
        time,
        distance,
        ratings,
        rate,
        JSON.stringify(special),
        mode,
        type,
        JSON.stringify(food),
        JSON.stringify(offers),
        bankOffers,
        isSpecial,
        id,
      ]
    )) as unknown as [IRestaurant];

    if (restaurant.affectedRows === 0) {
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
      "Restaurant details updated successfully!"
    );
  } catch (error: unknown) {
    if (error) {
      APIResponse(response, false, HTTP_STATUS.BAD_REQUEST, error as string);
    } else {
      return next(error);
    }
  }
};

const deleteRestaurantById: RequestHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const { id } = await request.params;
  try {
    const [restaurant] = (await db.query(
      "DELETE FROM restaurants WHERE id = ?",
      id
    )) as unknown as [IRestaurant];

    APIResponse(
      response,
      true,
      HTTP_STATUS.SUCCESS,
      "Restaurant deleted successfully!",
      restaurant
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
  getRestaurants,
  getRestaurantById,
  getRestaurantFood,
  createRestaurant,
  bookTable,
  updateRestaurant,
  deleteRestaurantById,
};
