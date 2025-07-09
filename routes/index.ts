import express, { Application } from "express";
import authRouter from "./auth.route";
import postRouter from "./post.route";
import fileRouter from "./file.route";
import osRouter from "./os.route";
import bufferRouter from "./buffer.route";
import assertRouter from "./assert.route";
import { HTTP_STATUS } from "../enums/status.enum";

const swaggerUI = require("swagger-ui-express");
const swaggerConfig = require("../config/swagger.config");

const BASE_PATH = "/v1/api";

const appRouter = express.Router();

appRouter.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerConfig));

appRouter.route("/").get((req, res) => {
  res
    .status(HTTP_STATUS.SUCCESS)
    .send(
      "<h1 style='text-align: center; margin-top: 50vh'>Welcome to Nodejs template project setup</h1>"
    );
});

export default (app: Application) => {
  const routes = () => {
    app.use(`${BASE_PATH}/`, appRouter);
    app.use(`${BASE_PATH}/auth`, authRouter);
    app.use(`${BASE_PATH}/`, postRouter);
    app.use(`${BASE_PATH}/`, fileRouter);
    app.use(`${BASE_PATH}/`, osRouter);
    app.use(`${BASE_PATH}/`, bufferRouter);
    app.use(`${BASE_PATH}/`, assertRouter);
  };
  routes();
};
