import express from "express";
import { validateToken } from "../middlewares/auth.middleware";
import tokenController from "../controllers/token.controller";
const tokenRouter = express.Router();

const { saveToken } = tokenController;

tokenRouter.use(validateToken);

tokenRouter.route("/save").post(saveToken);

export default tokenRouter;
