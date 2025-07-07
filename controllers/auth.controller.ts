import { Request, Response, RequestHandler, NextFunction } from "express";
import { HTTP_STATUS } from "../enums/status.enum";
import { randomUUID } from "crypto";
import { APIResponse } from "../helpers/apiResponse";
import bcryptjs from "bcryptjs";
import db from "../config/db.config";

const signup: RequestHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const reqBody = await request.body;
    const { first_name, last_name, email, password } = reqBody;
    const [[user]] = (await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ])) as any;

    if (user) {
      APIResponse(
        response,
        false,
        HTTP_STATUS.CREATED,
        "User already exists..!"
      );
      return;
    }

    const hashedPassword = await bcryptjs.hash(password, 16);

    const [userCreated] = (await db.query(
      "INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)",
      [first_name, last_name, email, hashedPassword]
    )) as any;

    if (!userCreated) {
      APIResponse(
        response,
        false,
        HTTP_STATUS.BAD_REQUEST,
        "Something went wrong..!"
      );
      return;
    }

    APIResponse(
      response,
      true,
      HTTP_STATUS.CREATED,
      "User successfully registered..!"
    );
  } catch (error: unknown) {
    if (error) {
      APIResponse(response, false, HTTP_STATUS.BAD_REQUEST, error as string);
    } else {
      return next(error);
    }
  }
};

const signin: RequestHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const reqBody = await request.body;
    const { password, email } = reqBody;
    const [[user]] = (await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ])) as any;

    if (!user) {
      APIResponse(
        response,
        false,
        HTTP_STATUS.BAD_REQUEST,
        "User not found..!"
      );
      return;
    }

    const validatePassword = await bcryptjs.compare(password, user.password);

    if (!validatePassword) {
      APIResponse(response, false, 401, "Invalid username or password..!");
      return;
    }

    const userData = {
      _id: randomUUID(),
      first_name: user.first_name,
      email: user.email,
    };

    APIResponse(response, true, HTTP_STATUS.SUCCESS, "Login successful..!", {
      user: userData,
    });
  } catch (error: unknown) {
    if (error) {
      APIResponse(response, false, HTTP_STATUS.BAD_REQUEST, error as string);
    } else {
      return next(error);
    }
  }
};

const logoutHandler: RequestHandler = async (
  _request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    APIResponse(
      response,
      true,
      HTTP_STATUS.SUCCESS,
      "Logged out successfully..!"
    );
    return;
  } catch (error: unknown) {
    return next(error);
  }
};

export default { signup, signin, logoutHandler };
