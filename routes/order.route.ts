import express from "express";
import { validateToken } from "../middlewares/auth.middleware";
import ordersController from "../controllers/orders.controller";
const orderRouter = express.Router();

const {
  getAllOrders,
  createOrder,
  capturePayment,
  capturePaymentFailure,
  refund,
} = ordersController;

orderRouter.use(validateToken);

orderRouter.route("/:userId").get(getAllOrders);

orderRouter.route("/createOrder").post(createOrder);

orderRouter.route("/capturePayment").post(capturePayment);

orderRouter
  .route("/capturePaymentFailure/:orderId")
  .post(capturePaymentFailure);

orderRouter.route("/refund").post(refund);

export default orderRouter;
