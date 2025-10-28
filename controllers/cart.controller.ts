import { Request, Response, RequestHandler, NextFunction } from "express";
import { HTTP_STATUS } from "../enums/status.enum";
import { APIResponse } from "../helpers/apiResponse";
import db from "../config/db.config";
import { IUser } from "../models/auth.model";
import { IRestaurant } from "../models/restaurants.model";

const getCartItems: RequestHandler = async (
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
        "User ID is missing!"
      );
    }

    if (!user.cart) {
      return APIResponse(
        response,
        true,
        HTTP_STATUS.SUCCESS,
        "Cart is empty!",
        { cart: [], restaurant: {} }
      );
    }

    const [[restaurant]] = (await db.query(
      "SELECT * FROM restaurants WHERE id = ?",
      [user.cart.restaurant]
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
      user.cart.food,
    ]);

    APIResponse(
      response,
      true,
      HTTP_STATUS.SUCCESS,
      "Cart items fetched successfully!",
      { cart, restaurant }
    );
  } catch (error: unknown) {
    if (error) {
      APIResponse(response, false, HTTP_STATUS.BAD_REQUEST, error as string);
    } else {
      return next(error);
    }
  }
};

const updateCartItems: RequestHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const { food, restaurant, action } = request.body;
    const { userId } = request.params;

    const [[rows]] = (await db.query("SELECT cart FROM users WHERE id = ?", [
      userId,
    ])) as unknown as [[IUser]];

    const currentCart: any = rows?.cart ? rows.cart : { restaurant, food: [] };

    if (!currentCart.restaurant) currentCart.restaurant = restaurant;

    if (currentCart.restaurant !== restaurant) {
      const [updateResult] = (await db.query(
        "UPDATE users SET cart = ? WHERE id = ?",
        [JSON.stringify({ restaurant, food: [food] }), userId]
      )) as unknown as [{ affectedRows: number }];

      if (updateResult.affectedRows === 0) {
        APIResponse(
          response,
          false,
          HTTP_STATUS.INTERNAL_SERVER,
          "Failed to update cart!"
        );
        return;
      }

      APIResponse(
        response,
        true,
        HTTP_STATUS.SUCCESS,
        "Cart updated successfully!"
      );
      return;
    }

    if (action === "add") {
      currentCart.food.push(food);
    } else if (action === "remove") {
      const index = currentCart.food.indexOf(food);
      if (index > -1) currentCart.food.splice(index, 1);
    } else {
      APIResponse(response, false, HTTP_STATUS.BAD_REQUEST, "Invalid action!");
      return;
    }

    const updatedCart =
      currentCart.food.length > 0
        ? { ...currentCart }
        : { restaurant: null, food: [] };

    const [updateResult] = (await db.query(
      "UPDATE users SET cart = ? WHERE id = ?",
      [JSON.stringify(updatedCart), userId]
    )) as unknown as [{ affectedRows: number }];

    if (updateResult.affectedRows === 0) {
      APIResponse(
        response,
        false,
        HTTP_STATUS.INTERNAL_SERVER,
        "Failed to update cart!"
      );
      return;
    }

    APIResponse(
      response,
      true,
      HTTP_STATUS.SUCCESS,
      "Cart updated successfully!"
    );
  } catch (error: unknown) {
    if (error) {
      APIResponse(response, false, HTTP_STATUS.BAD_REQUEST, error as string);
    } else {
      return next(error);
    }
  }
};

const reorderCart: RequestHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const { food, restaurant } = request.body;
    const { userId } = request.params;

    const [updateResult] = (await db.query(
      "UPDATE users SET cart = ? WHERE id = ?",
      [JSON.stringify({ food, restaurant }), userId]
    )) as unknown as [{ affectedRows: number }];

    if (updateResult.affectedRows === 0) {
      APIResponse(
        response,
        false,
        HTTP_STATUS.INTERNAL_SERVER,
        "Failed to reorder!"
      );
      return;
    }

    APIResponse(
      response,
      true,
      HTTP_STATUS.SUCCESS,
      "Added reordered items to cart successfully!",
      { food, restaurant }
    );
  } catch (error: unknown) {
    if (error) {
      APIResponse(response, false, HTTP_STATUS.BAD_REQUEST, error as string);
    } else {
      return next(error);
    }
  }
};

const clearCartItems: RequestHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const { userId } = request.params;

    const [updateResult] = (await db.query(
      "UPDATE users SET cart = ? WHERE id = ?",
      [null, userId]
    )) as unknown as [{ affectedRows: number }];

    if (updateResult.affectedRows === 0) {
      return APIResponse(
        response,
        false,
        HTTP_STATUS.INTERNAL_SERVER,
        "Failed to clear cart!"
      );
    }

    APIResponse(response, true, HTTP_STATUS.SUCCESS, "Cart cleared!");
  } catch (error: unknown) {
    if (error) {
      APIResponse(response, false, HTTP_STATUS.BAD_REQUEST, error as string);
    } else {
      return next(error);
    }
  }
};

export default {
  getCartItems,
  updateCartItems,
  reorderCart,
  clearCartItems,
};
