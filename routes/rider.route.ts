import express from "express";
import riderController from "../controllers/rider.controller";
import { validateToken } from "../middlewares/auth.middleware";

const riderRouter = express.Router();

const { getAllRequests, getDashboardData, registerRider, updateRiderRequest } =
  riderController;

riderRouter.use(validateToken);

riderRouter.get("/", getAllRequests);

riderRouter.get("/get-dashboard-details/:userId", getDashboardData);

riderRouter.post("/register", registerRider);

riderRouter.put("/:id", updateRiderRequest);

export default riderRouter;
