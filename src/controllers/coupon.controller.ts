import { Request, Response, RequestHandler, NextFunction } from "express";
import { HTTP_STATUS } from "../enums/status.enum";
import { APIResponse } from "../helpers/apiResponse";
import db from "../config/db.config";
import { ICoupon } from "../models/coupons.model";

const getAllCoupons: RequestHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const [coupons] = (await db.query("SELECT * FROM coupons")) as unknown as [
      ICoupon
    ];

    if (!coupons) {
      return APIResponse(
        response,
        false,
        HTTP_STATUS.BAD_REQUEST,
        "No coupons available!"
      );
    }

    APIResponse(
      response,
      true,
      HTTP_STATUS.SUCCESS,
      "Coupon codes fetched successfully!",
      coupons
    );
  } catch (error: unknown) {
    if (error) {
      APIResponse(response, false, HTTP_STATUS.BAD_REQUEST, error as string);
    } else {
      return next(error);
    }
  }
};

const validateCoupon: RequestHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const { code } = request.body;
    const { userId } = request.params;

    if (code?.length === 0) {
      APIResponse(
        response,
        false,
        HTTP_STATUS.BAD_REQUEST,
        "Coupon code is not provided!"
      );
      return;
    }

    const [coupons] = (await db.query("SELECT * FROM coupons", [
      Number(userId),
    ])) as any;

    if (coupons?.length === 0) {
      APIResponse(
        response,
        false,
        HTTP_STATUS.BAD_REQUEST,
        "Coupons not found!"
      );
      return;
    }

    const matchedCode = coupons?.find(
      (coupon: { code: string }) =>
        coupon.code?.toLowerCase() === code?.toLowerCase()
    );

    if (!matchedCode?.id) {
      APIResponse(
        response,
        false,
        HTTP_STATUS.BAD_REQUEST,
        "Coupon not available, Please try another!"
      );
      return;
    } else if (matchedCode?.isActive === 0) {
      APIResponse(
        response,
        false,
        HTTP_STATUS.BAD_REQUEST,
        "Offer expired or not applicable!"
      );
      return;
    } else if (matchedCode?.redeemed?.includes(Number(userId))) {
      APIResponse(
        response,
        false,
        HTTP_STATUS.BAD_REQUEST,
        "Offer valid only once per user!"
      );
      return;
    }

    APIResponse(
      response,
      true,
      HTTP_STATUS.SUCCESS,
      "Coupon code applied successfully!",
      matchedCode?.discount
    );
  } catch (error: unknown) {
    if (error) {
      APIResponse(response, false, HTTP_STATUS.BAD_REQUEST, error as string);
    } else {
      return next(error);
    }
  }
};

const updateCouponRedemption: RequestHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const { code } = request.body;
    const { userId } = request.params;

    const [coupons] = (await db.query("SELECT * FROM coupons", [
      Number(userId),
    ])) as any;

    const matchedCode = coupons?.find(
      (coupon: { code: string }) =>
        coupon.code?.toLowerCase() === code?.toLowerCase()
    );

    const [coupon] = (await db.query(
      "UPDATE coupons SET redeemed = ? WHERE id = ?",
      [
        JSON.stringify(
          matchedCode?.redeemed
            ? [...matchedCode?.redeemed, Number(userId)]
            : [Number(userId)]
        ),
        matchedCode?.id,
      ]
    )) as unknown as [ICoupon];

    if (coupon)
      APIResponse(
        response,
        true,
        HTTP_STATUS.SUCCESS,
        "Coupon code redeemed!",
        matchedCode?.discount
      );
  } catch (error: unknown) {
    if (error) {
      APIResponse(response, false, HTTP_STATUS.BAD_REQUEST, error as string);
    } else {
      return next(error);
    }
  }
};

const getCouponById: RequestHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const { id } = await request.params;
  try {
    const [[coupon]] = (await db.query(
      "SELECT * FROM coupons WHERE id = ?",
      id
    )) as unknown as [[ICoupon]];

    APIResponse(
      response,
      true,
      HTTP_STATUS.SUCCESS,
      "Coupon details fetched successfully!",
      coupon
    );
  } catch (error: unknown) {
    if (error) {
      APIResponse(response, false, HTTP_STATUS.BAD_REQUEST, error as string);
    } else {
      return next(error);
    }
  }
};

const createCoupon: RequestHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const { code, discount, isActive = 0 } = await request.body;
  try {
    const [coupon] = (await db.query(
      "INSERT INTO coupons (code, discount, isActive) VALUES (?, ?, ?)",
      [code, discount, isActive]
    )) as unknown as [ICoupon];

    if (coupon.affectedRows === 0) {
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
      "Coupon created successfully!",
      coupon
    );
  } catch (error: unknown) {
    if (error) {
      APIResponse(response, false, HTTP_STATUS.BAD_REQUEST, error as string);
    } else {
      return next(error);
    }
  }
};

const updateCoupon: RequestHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const { id } = await request.params;
  const { code, discount, isActive = 0 } = await request.body;

  try {
    const [coupon] = (await db.query(
      "UPDATE coupons SET code = ?, discount = ?, isActive = ? WHERE id = ?",
      [code, discount, isActive, id]
    )) as unknown as [ICoupon];

    if (coupon.affectedRows === 0) {
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
      "Coupon updated successfully!"
    );
  } catch (error: unknown) {
    if (error) {
      APIResponse(response, false, HTTP_STATUS.BAD_REQUEST, error as string);
    } else {
      return next(error);
    }
  }
};

const deleteCouponById: RequestHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const { id } = await request.params;
  try {
    const [coupon] = (await db.query(
      "DELETE FROM coupons WHERE id = ?",
      id
    )) as unknown as [ICoupon];

    APIResponse(
      response,
      true,
      HTTP_STATUS.SUCCESS,
      "Coupon deleted successfully!",
      coupon
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
  getAllCoupons,
  validateCoupon,
  updateCouponRedemption,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCouponById,
};
