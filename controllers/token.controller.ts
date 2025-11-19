import { Request, Response, RequestHandler, NextFunction } from "express";
import { HTTP_STATUS } from "../enums/status.enum";
import { APIResponse } from "../helpers/apiResponse";
import db from "../config/db.config";
import { IUser } from "../models/auth.model";

const saveToken: RequestHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const { token, userId } = request.body;
  try {
    const [user] = (await db.query("UPDATE users SET token = ? WHERE id = ?", [
      token,
      userId,
    ])) as unknown as [IUser];

    if (user.affectedRows === 0) {
      return APIResponse(
        response,
        false,
        HTTP_STATUS.BAD_REQUEST,
        "User not found!"
      );
    }

    APIResponse(
      response,
      true,
      HTTP_STATUS.SUCCESS,
      "Token saved successfully!",
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

export default { saveToken };
