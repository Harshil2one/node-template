import express from "express";
import restaurantsController from "../controllers/restaurants.controller";
import {
  checkRestaurant,
  validateBody,
} from "../middlewares/restaurant.middleware";
import { validateToken } from "../middlewares/auth.middleware";
const restaurantRouter = express.Router();

const {
  getRestaurants,
  getRestaurantById,
  getRestaurantFood,
  createRestaurant,
  bookTable,
  updateRestaurant,
  deleteRestaurantById,
} = restaurantsController;

restaurantRouter.param("id", checkRestaurant);

/**
 * @openapi
 * /v1/api/restaurants:
 *   get:
 *     summary: Get all restaurants
 *     description: Fetch all restaurants
 *     operationId: getRestaurants
 *     tags:
 *       - Restaurants
 *     responses:
 *       200:
 *         description: Successfully fetch all restaurants
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 status:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Restaurants fetched successfully!
 *       401:
 *         description: Unauthorized - User can not get restaurants
 *     servers:
 *       - url: http://localhost:8000
 *         description: Local development server
 */
restaurantRouter.route("/").get(getRestaurants);

/**
 * @openapi
 * /v1/api/restaurants/2:
 *   get:
 *     summary: Get restaurant details
 *     description: Fetch restaurant details.
 *     operationId: getRestaurantById
 *     tags:
 *       - Restaurants
 *     responses:
 *       200:
 *         description: Successfully fetch restaurant details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 status:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Restaurant details fetched successfully!
 *                 data:
 *                   type: object
 *       401:
 *         description: Unauthorized - User can not get restaurant details
 *     servers:
 *       - url: http://localhost:8000
 *         description: Local development server
 */
restaurantRouter.route("/:id").get(getRestaurantById);

/**
 * @openapi
 * /v1/api/restaurants/2/food:
 *   get:
 *     summary: Get restaurant food items
 *     description: Fetch restaurant food items.
 *     operationId: getRestaurantFood
 *     tags:
 *       - Restaurant Foods
 *     responses:
 *       200:
 *         description: Successfully fetch restaurant food items
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 status:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Restaurant food items fetched successfully!
 *                 data:
 *                   type: object
 *       401:
 *         description: Unauthorized - User can not get restaurant food items
 *     servers:
 *       - url: http://localhost:8000
 *         description: Local development server
 */
restaurantRouter.route("/food/:id").get(getRestaurantFood);

restaurantRouter.use(validateToken);

/**
 * @openapi
 * /v1/api/restaurants:
 *   restaurants:
 *     summary: Create restaurant
 *     requestBody:
 *       required: true
 *       content:
 *          application/json:
 *             schema:
 *               type: object
 *     description: Create new restaurant
 *     operationId: createRestaurant
 *     tags:
 *       - Restaurants
 *     responses:
 *       200:
 *         description: Successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 status:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Restaurant created successfully!
 *       401:
 *         description: Unauthorized - User can not create restaurants
 *     servers:
 *       - url: http://localhost:8000
 *         description: Local development server
 */
restaurantRouter.route("/").post(validateBody, createRestaurant);

restaurantRouter.route("/book-table").post(bookTable);

/**
 * @openapi
 * /v1/api/restaurants/4:
 *   put:
 *     summary: Update restaurant
 *     requestBody:
 *       required: true
 *       content:
 *          application/json:
 *             schema:
 *               type: object
 *     description: Update restaurant details
 *     operationId: updateRestaurant
 *     tags:
 *       - Restaurants
 *     responses:
 *       200:
 *         description: Successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 status:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Restaurant updated successfully!
 *       401:
 *         description: Unauthorized - User can not update restaurants
 *     servers:
 *       - url: http://localhost:8000
 *         description: Local development server
 */
restaurantRouter.route("/:id").put(validateBody, updateRestaurant);

/**
 * @openapi
 * /v1/api/restaurants/2:
 *   delete:
 *     summary: Delete restaurant
 *     description: Delete restaurant.
 *     operationId: deleteRestaurantById
 *     tags:
 *       - Restaurants
 *     responses:
 *       200:
 *         description: Successfully deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 status:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Restaurant deleted successfully!
 *       401:
 *         description: Unauthorized - User can not delete restaurants
 *     servers:
 *       - url: http://localhost:8000
 *         description: Local development server
 */
restaurantRouter.route("/:id").delete(deleteRestaurantById);

// ALTERNATIVE WAY:
// restaurantRouter.route("/").get(getRestaurants).post(validateBody, createRestaurant);
// restaurantRouter.route("/:id").get(getRestaurantById).put(validateBody, updateRestaurant).delete(deleteRestaurantById);

export default restaurantRouter;
