import { Application } from "express";
import authRouter from "./auth.route";
import postRouter from "./post.route";
import fileRouter from "./file.route";
import osRouter from "./os.route";

const BASE_PATH = "/v1/api";

export default (app: Application) => {
  const routes = () => {
    app.use(`${BASE_PATH}/auth`, authRouter);
    app.use(`${BASE_PATH}/`, postRouter);
    app.use(`${BASE_PATH}/`, fileRouter);
    app.use(`${BASE_PATH}/`, osRouter);
  };
  routes();
};
