import { Request, Response, RequestHandler, NextFunction } from "express";
import { HTTP_STATUS } from "../enums/status.enum";
import { APIResponse } from "../helpers/apiResponse";
import db from "../config/db.config";
import { IFood } from "../models/restaurants.model";

const getFoods: RequestHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const [foods] = (await db.query("SELECT * FROM foods")) as unknown as [
      IFood
    ];

    if (!foods) {
      return APIResponse(
        response,
        false,
        HTTP_STATUS.BAD_REQUEST,
        "No Foods listed!"
      );
    }

    APIResponse(
      response,
      true,
      HTTP_STATUS.SUCCESS,
      "Food items fetched successfully!",
      foods
    );
  } catch (error: unknown) {
    if (error) {
      APIResponse(response, false, HTTP_STATUS.BAD_REQUEST, error as string);
    } else {
      return next(error);
    }
  }
};

const getFoodById: RequestHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const { id } = await request.params;
  try {
    const [[food]] = (await db.query(
      "SELECT * FROM foods WHERE id = ?",
      id
    )) as unknown as [[IFood]];

    APIResponse(
      response,
      true,
      HTTP_STATUS.SUCCESS,
      "Food details fetched successfully!",
      food
    );
  } catch (error: unknown) {
    if (error) {
      APIResponse(response, false, HTTP_STATUS.BAD_REQUEST, error as string);
    } else {
      return next(error);
    }
  }
};

const createFood: RequestHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const {
    name,
    image = null,
    description,
    price = 0,
    type = "veg",
    isBest = 0,
  } = await request.body;
  try {
    const [food] = (await db.query(
      "INSERT INTO foods (name, image, description, price, ratings, ratingsCount, type, isBest) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [name, image, description, price, 0, 0, type, isBest]
    )) as unknown as [IFood];

    if (food.affectedRows === 0) {
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
      "Food created successfully!",
      food
    );
  } catch (error: unknown) {
    if (error) {
      APIResponse(response, false, HTTP_STATUS.BAD_REQUEST, error as string);
    } else {
      return next(error);
    }
  }
};

const updateFood: RequestHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const { id } = await request.params;
  const {
    name,
    image = null,
    description,
    price = 0,
    type = "veg",
    isBest = 0,
  } = await request.body;

  try {
    const [food] = (await db.query(
      "UPDATE foods SET name = ?, image = ?, description = ?, price = ?, type = ?, isBest = ? WHERE id = ?",
      [name, image, description, price, type, isBest, id]
    )) as unknown as [IFood];

    if (food.affectedRows === 0) {
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
      "Food details updated successfully!"
    );
  } catch (error: unknown) {
    if (error) {
      APIResponse(response, false, HTTP_STATUS.BAD_REQUEST, error as string);
    } else {
      return next(error);
    }
  }
};

const deleteFoodById: RequestHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const { id } = await request.params;
  try {
    const [food] = (await db.query(
      "DELETE FROM foods WHERE id = ?",
      id
    )) as unknown as [IFood];

    APIResponse(
      response,
      true,
      HTTP_STATUS.SUCCESS,
      "Food deleted successfully!",
      food
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
  getFoods,
  getFoodById,
  createFood,
  updateFood,
  deleteFoodById,
};
