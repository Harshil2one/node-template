import { NextFunction } from "connect";
import { APIResponse } from "../helpers/apiResponse";
import { HTTP_STATUS } from "../enums/status.enum";
const jwt = require("jsonwebtoken");

export const validateToken = async (req: any, res: any, next: NextFunction) => {
  const { token } = req.headers;
  const verify = await jwt.verify(token, process.env.JWT_SECRET);
  if (!verify) {
    return APIResponse(res, false, HTTP_STATUS.BAD_REQUEST, "Invalid token found!");
  }
  next();
};
