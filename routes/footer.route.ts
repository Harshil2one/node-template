import express from "express";
import { validateToken } from "../middlewares/auth.middleware";
import footerController from "../controllers/footer.controller";

const footerRouter = express.Router();

const { contactUs } = footerController;

footerRouter.use(validateToken);

footerRouter.post("/contact-us", contactUs);

export default footerRouter;
