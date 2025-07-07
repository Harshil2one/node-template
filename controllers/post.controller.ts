import { Request, Response, RequestHandler, NextFunction } from "express";
import { HTTP_STATUS } from "../enums/status.enum";
import { APIResponse } from "../helpers/apiResponse";
import db from "../config/db.config";

const getPosts: RequestHandler = async (
  _request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const [posts] = await db.query("SELECT * FROM posts");

    APIResponse(
      response,
      true,
      HTTP_STATUS.SUCCESS,
      "Posts fetched successfully..!",
      posts
    );
  } catch (error: unknown) {
    if (error) {
      APIResponse(response, false, HTTP_STATUS.BAD_REQUEST, error as string);
    } else {
      return next(error);
    }
  }
};

export default { getPosts };
