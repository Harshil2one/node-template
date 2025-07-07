import express from "express";
import authController from "../controllers/auth.controller";
const authRouter = express.Router();

const { signup, signin, logoutHandler } = authController;

authRouter.route("/signup").post(signup);
authRouter.route("/signin").post(signin);
authRouter.route("/logout").get(logoutHandler);

export default authRouter;
