import { NextFunction, Request, RequestHandler, Response } from "express";
import { HTTP_STATUS } from "../enums/status.enum";
import { APIResponse } from "../helpers/apiResponse";
import db from "../config/db.config";
import { IContactUs } from "../models/footer.model";

const contactUs: RequestHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const reqBody = await request.body;
    const { name, email, message } = reqBody;

    const [contact] = (await db.query(
      "INSERT INTO queries (name, email, message) VALUES (?, ?, ?)",
      [name, email, message]
    )) as unknown as [IContactUs];

    if (!contact) {
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
      HTTP_STATUS.CREATED,
      "Query registered successfully!"
    );
  } catch (error: unknown) {
    if (error) {
      APIResponse(response, false, HTTP_STATUS.BAD_REQUEST, error as string);
    } else {
      return next(error);
    }
  }
};

export default { contactUs };
