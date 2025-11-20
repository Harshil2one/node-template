import express from "express";
import cartController from "../controllers/cart.controller";
import { validateToken } from "../middlewares/auth.middleware";
const cartRouter = express.Router();

const { getCartItems, updateCartItems, reorderCart, clearCartItems } = cartController;

cartRouter.use(validateToken);

/**
 * @openapi
 * /v1/api/cart:
 *   get:
 *     summary: Get all cart items
 *     description: Fetch all cart items
 *     operationId: getCartItems
 *     tags:
 *       - Cart items
 *     responses:
 *       200:
 *         description: Successfully fetch all cart items
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
 *                   example: Cart items fetched successfully!
 *       401:
 *         description: Unauthorized - User can not get cart items
 */
cartRouter.route("/:userId").get(getCartItems);

/**
 * @openapi
 * /v1/api/cart:
 *   put:
 *     summary: Update cart items
 *     description: Update cart details
 *     operationId: updateCartItems
 *     tags:
 *       - Update cart items
 *     responses:
 *       200:
 *         description: Successfully update cart items
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
 *                   example: Cart items updated successfully!
 *       401:
 *         description: Unauthorized - User can not get cart items
 */
cartRouter.route("/:userId").put(updateCartItems);

cartRouter.route("/reorder/:userId").put(reorderCart);

cartRouter.route("/:userId").delete(clearCartItems);

export default cartRouter;
