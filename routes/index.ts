import express, { Application } from "express";
import authRouter from "./auth.route";
import restaurantRouter from "./restaurants.route";
import { HTTP_STATUS } from "../enums/status.enum";
import profileRouter from "./profile.route";
import cartRouter from "./cart.route";
import couponRouter from "./coupon.route";
import jobsRouter from "./jobs.route";
import orderRouter from "./order.route";
import foodRouter from "./food.route";
import riderRouter from "./rider.route";
import chatRouter from "./chat.route";
import footerRouter from "./footer.route";
import csvRouter from "./csv.route";

const swaggerUI = require("swagger-ui-express");
const swaggerConfig = require("../config/swagger.config");

const BASE_PATH = "/v1/api";

const appRouter = express.Router();

appRouter.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerConfig));

appRouter.route("/").get((req, res) => {
  res.status(HTTP_STATUS.SUCCESS).send(
    `<div style='display: flex; flex-direction: column; gap: 10px; align-items: center; justify-content: center;'>
        <h1 style='text-align: center'>Welcome to BigBite Backend</h1>
        <a href='http://localhost:${process.env.PORT}${BASE_PATH}/api-docs' style='border: 1px solid black; padding: 10px 14px; border-radius: 4px; text-decoration: none; color: blue'>View Swagger collection</a>
      </div>`
  );
});

export default (app: Application) => {
  const routes = () => {
    app.use(`${BASE_PATH}/`, appRouter);
    app.use(`${BASE_PATH}/auth`, authRouter);
    app.use(`${BASE_PATH}/restaurants`, restaurantRouter);
    app.use(`${BASE_PATH}/cart`, cartRouter);
    app.use(`${BASE_PATH}/coupon`, couponRouter);
    app.use(`${BASE_PATH}/jobs`, jobsRouter);
    app.use(`${BASE_PATH}/orders`, orderRouter);
    app.use(`${BASE_PATH}/foods`, foodRouter);
    app.use(`${BASE_PATH}/profile`, profileRouter);
    app.use(`${BASE_PATH}/riders`, riderRouter);
    app.use(`${BASE_PATH}/chat`, chatRouter);
    app.use(`${BASE_PATH}/custom`, footerRouter);
    app.use(`${BASE_PATH}/csv`, csvRouter);
  };
  routes();
};
