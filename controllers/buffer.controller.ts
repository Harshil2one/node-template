import { Request, Response, RequestHandler, NextFunction } from "express";
import { HTTP_STATUS } from "../enums/status.enum";
import { APIResponse } from "../helpers/apiResponse";

const createEmptyBuffer: RequestHandler = async (
  _request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const buffer = Buffer.alloc(15);

    APIResponse(
      response,
      true,
      HTTP_STATUS.SUCCESS,
      "Empty buffer created successfully..!",
      { data: buffer }
    );
  } catch (error: unknown) {
    if (error) {
      APIResponse(response, false, HTTP_STATUS.BAD_REQUEST, error as string);
    } else {
      return next(error);
    }
  }
};

const createBuffer: RequestHandler = async (
    _request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const buffer = Buffer.from("Buffer content");
  
      APIResponse(
        response,
        true,
        HTTP_STATUS.SUCCESS,
        "Buffer created and fetched successfully..!",
        { content: buffer.toString(), length: buffer.length, ASCI: buffer[0] }
      );
    } catch (error: unknown) {
      if (error) {
        APIResponse(response, false, HTTP_STATUS.BAD_REQUEST, error as string);
      } else {
        return next(error);
      }
    }
  };

export default { createBuffer };
