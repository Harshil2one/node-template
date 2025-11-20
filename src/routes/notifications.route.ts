import express from "express";
import { validateToken } from "../middlewares/auth.middleware";
import notificationController from "../controllers/notification.controller";
const notificationRouter = express.Router();

const { getAllNotifications, markAsReadNotification, markAllAsRead } =
  notificationController;

notificationRouter.use(validateToken);

notificationRouter.route("/mark-as-read/:receiverId").delete(markAllAsRead);

notificationRouter.route("/:receiverId").get(getAllNotifications);

notificationRouter
  .route("/mark-as-read/:notificationId")
  .get(markAsReadNotification);

export default notificationRouter;
