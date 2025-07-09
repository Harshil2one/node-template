import express from "express";
import authController from "../controllers/auth.controller";
const authRouter = express.Router();

const { signup, signin, logoutHandler } = authController;

/**
 * @openapi
 * /v1/api/auth/signup:
 *   post:
 *     summary: Register new user
 *     requestBody:
 *       required: true
 *       content:
 *          application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 first_name:
 *                    type: string
 *                    example: Test
 *                 last_name:
 *                    type: string
 *                    example: user
 *                 email:
 *                    type: string
 *                    example: test@yopmail.com
 *                 password:
 *                    type: string
 *                    example: Test@123
 *     description: Add new user details and provide access of other pages.
 *     operationId: signupUser
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Successfully registered
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
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: User successfully registered..!
 *       401:
 *         description: Unauthorized - User not registered
 *     servers:
 *       - url: http://localhost:8000
 *         description: Local development server
 */
authRouter.route("/signup").post(signup);

/**
 * @openapi
 * /v1/api/auth/signin:
 *   post:
 *     summary: Login user
 *     requestBody:
 *       required: true
 *       content:
 *          application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 email:
 *                    type: string
 *                    example: test@yopmail.com
 *                 password:
 *                    type: string
 *                    example: Test@123
 *     description: Login existing user into application.
 *     operationId: signinUser
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Successfully login
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
 *                   example: Login successful..!
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                          id:
 *                              type: number
 *                              example: 2
 *                          first_name:
 *                              type: string
 *                              example: Test
 *                          email:
 *                              type: string
 *                              example: test@yopmail.com
 *       401:
 *         description: Unauthorized - User not logged in
 *     servers:
 *       - url: http://localhost:8000
 *         description: Local development server
 */
authRouter.route("/signin").post(signin);

/**
 * @openapi
 * /v1/api/auth/logout:
 *   get:
 *     summary: Logout the user
 *     description: Ends the user's session and clears their authentication token or cookie.
 *     operationId: logoutUser
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Successfully logged out
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logged out successfully
 *       401:
 *         description: Unauthorized - User not logged in
 *     servers:
 *       - url: http://localhost:8000
 *         description: Local development server
 */
authRouter.route("/logout").get(logoutHandler);

export default authRouter;
