import express from "express";
import foodsController from "../controllers/food.controller";
import { validateToken } from "../middlewares/auth.middleware";
const foodRouter = express.Router();

const { getFoods, getFoodById, createFood, updateFood, deleteFoodById } =
  foodsController;

foodRouter.use(validateToken);

foodRouter.get("/", getFoods);

foodRouter.get("/:id", getFoodById);

foodRouter.post("/", createFood);

foodRouter.put("/:id", updateFood);

foodRouter.delete("/:id", deleteFoodById);

export default foodRouter;
