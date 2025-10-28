import express from "express";
import riderController from "../controllers/rider.controller";
import { validateToken } from "../middlewares/auth.middleware";

const riderRouter = express.Router();

const { getAllRequests, registerRider, updateRiderRequest } = riderController;

riderRouter.use(validateToken);

riderRouter.get("/", getAllRequests);

riderRouter.post("/register", registerRider);

riderRouter.put("/:id", updateRiderRequest);

export default riderRouter;
