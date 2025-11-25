import express from "express";
import { validateToken } from "../middlewares/auth.middleware";
import timeSlotController from "../controllers/timeSlot.controller";
const timeSlotRouter = express.Router();

const { getBookings, getBookingsByRestaurantId, getTimeSlotsByRestaurantId } =
  timeSlotController;

timeSlotRouter.use(validateToken);

timeSlotRouter.route("/:restaurantId").get(getTimeSlotsByRestaurantId);

timeSlotRouter.route("/bookings/:restaurantId").get(getBookingsByRestaurantId);

timeSlotRouter.route("/booked/:userId").get(getBookings);

export default timeSlotRouter;
