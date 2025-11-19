import { Request, Response, RequestHandler, NextFunction } from "express";
import { HTTP_STATUS } from "../enums/status.enum";
import { APIResponse } from "../helpers/apiResponse";
import db from "../config/db.config";
import { IUser } from "../models/auth.model";

const getProfile: RequestHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const { id } = await request.params;
    const [[user]] = (await db.query("SELECT * FROM users WHERE id = ?", [
      id,
    ])) as unknown as [[IUser]];

    APIResponse(
      response,
      true,
      HTTP_STATUS.SUCCESS,
      "Profile details fetched successfully!",
      user
    );
  } catch (error: unknown) {
    if (error) {
      APIResponse(response, false, HTTP_STATUS.BAD_REQUEST, error as string);
    } else {
      return next(error);
    }
  }
};

const updateProfile: RequestHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const { id } = request.params;
  const { name, image, email, contact, address } = request.body;

  try {
    const [user] = (await db.query(
      "UPDATE users SET name = ?, image = ?, email = ?, contact = ?, address = ? WHERE id = ?",
      [name, image, email, contact, JSON.stringify(address), id]
    )) as unknown as [IUser];

    if (user.affectedRows === 0) {
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
      "Profile details updated successfully!"
    );
  } catch (error: unknown) {
    if (error) {
      APIResponse(response, false, HTTP_STATUS.BAD_REQUEST, error as string);
    } else {
      return next(error);
    }
  }
};

const updateProfileAddress: RequestHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const { id } = request.params;
  const { address } = request.body;

  try {
    const [user] = (await db.query(
      "UPDATE users SET address = ? WHERE id = ?",
      [address, id]
    )) as unknown as [IUser];

    if (user.affectedRows === 0) {
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
      "Address details updated successfully!"
    );
  } catch (error: unknown) {
    if (error) {
      APIResponse(response, false, HTTP_STATUS.BAD_REQUEST, error as string);
    } else {
      return next(error);
    }
  }
};

const deleteAccount: RequestHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const { id } = await request.params;
  try {
    const [user] = (await db.query(
      "DELETE FROM users WHERE id = ?",
      id
    )) as unknown as [IUser];

    if (user?.affectedRows !== 1) {
      APIResponse(
        response,
        false,
        HTTP_STATUS.BAD_REQUEST,
        "Something went wrong!"
      );
      return;
    }

    APIResponse(
      response,
      true,
      HTTP_STATUS.SUCCESS,
      "Account deleted successfully!"
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
  getProfile,
  updateProfile,
  updateProfileAddress,
  deleteAccount,
};
