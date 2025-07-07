import express from "express";
import osController from "../controllers/os.controller";
const osRouter = express.Router();

const { getOSDetails } = osController;

osRouter.route("/get-os-details").get(getOSDetails);

export default osRouter;
