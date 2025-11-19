import express from "express";
import { validateToken } from "../middlewares/auth.middleware";
import ordersController from "../controllers/orders.controller";
const orderRouter = express.Router();

const {
  getAllOrders,
  getOrdersByUser,
  getOrderByOrderId,
  getOrdersByRestaurant,
  getRideRequests,
  updateOrderStatus,
  updateOrderRatings,
  createOrder,
  cancelOrder,
  capturePayment,
  capturePaymentFailure,
} = ordersController;

orderRouter.use(validateToken);

orderRouter.route("/").get(getAllOrders);

orderRouter.route("/rides").get(getRideRequests);

orderRouter.route("/:userId").get(getOrdersByUser);

orderRouter.route("/status/:orderId").get(getOrderByOrderId);

orderRouter.route("/restaurant/:restaurantId").get(getOrdersByRestaurant);

orderRouter.route("/update-status").post(updateOrderStatus);

orderRouter.route("/ratings/:orderId").post(updateOrderRatings);

orderRouter.route("/createOrder").post(createOrder);

orderRouter.route("/cancel/:id").post(cancelOrder);

orderRouter.route("/capturePayment").post(capturePayment);

orderRouter
  .route("/capturePaymentFailure/:orderId")
  .post(capturePaymentFailure);

export default orderRouter;
