import { Request, Response, RequestHandler, NextFunction } from "express";
import { HTTP_STATUS } from "../enums/status.enum";
import { APIResponse } from "../helpers/apiResponse";

const createEmptyBuffer: RequestHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const { size } = await request.query;
    const buffer = Buffer.alloc(Number(size));

    APIResponse(
      response,
      true,
      HTTP_STATUS.SUCCESS,
      `Empty buffer with size of ${size} created successfully..!`,
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
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const { content } = await request.query;
    const buffer = Buffer.from(content as string);

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

export default { createEmptyBuffer, createBuffer };
