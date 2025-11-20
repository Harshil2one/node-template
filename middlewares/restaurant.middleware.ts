import { NextFunction } from "connect";
import db from "../config/db.config";
import { APIResponse } from "../helpers/apiResponse";
import { HTTP_STATUS } from "../enums/status.enum";

export const checkRestaurant = async (
  _req: any,
  res: any,
  next: NextFunction,
  value: string
) => {
  const [restaurant] = (await db.query(
    "SELECT * FROM restaurants WHERE id = ?",
    Number(value)
  )) as any;

  if (restaurant?.length === 0) {
    return APIResponse(
      res,
      false,
      HTTP_STATUS.NOT_FOUND,
      "Restaurant not found!"
    );
  }
  next();
};

export const validateBody = (req: any, res: any, next: NextFunction) => {
  const { name, address, email, contact } = req.body;
  if (!(name || address || email || contact)) {
    return APIResponse(
      res,
      false,
      HTTP_STATUS.BAD_REQUEST,
      "Please provide valid restaurant data!"
    );
  }
  next();
};
