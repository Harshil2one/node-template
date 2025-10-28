import express from "express";
import { validateToken } from "../middlewares/auth.middleware";
import couponController from "../controllers/coupon.controller";
const couponRouter = express.Router();

const { getAllCoupons, validateCoupon, getCouponById, createCoupon, updateCoupon, deleteCouponById } = couponController;

couponRouter.use(validateToken);

couponRouter.route("/").get(getAllCoupons);

/**
 * @openapi
 * /v1/api/coupon:
 *   get:
 *     summary: Validate coupon code
 *     description: return discounted price
 *     operationId: validateCoupon
 *     tags:
 *       - Coupon codes
 *     responses:
 *       200:
 *         description: Successfully validate coupon codes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 status:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Coupon code applied successfully!
 *       401:
 *         description: Unauthorized - User can not apply same coupon
 *     servers:
 *       - url: http://localhost:8000
 *         description: Local development server
 */
couponRouter.route("/:userId").post(validateCoupon);

couponRouter.get("/:id", getCouponById);

couponRouter.post("/", createCoupon);

couponRouter.put("/:id", updateCoupon);

couponRouter.delete("/:id", deleteCouponById);

export default couponRouter;
