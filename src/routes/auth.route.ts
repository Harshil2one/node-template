import express from "express";
import authController from "../controllers/auth.controller";
import { validateToken } from "../middlewares/auth.middleware";
const authRouter = express.Router();

const {
  getAllRoles,
  getAllUsers,
  signup,
  signin,
  sendOtpMail,
  verifyOtp,
  updatePassword,
  deleteUserById,
  sendMonitoringDetails,
} = authController;

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
 *                 name:
 *                    type: string
 *                    example: Test
 *                 email:
 *                    type: string
 *                    example: test@yopmail.com
 *                 password:
 *                    type: string
 *                    example: Test@123
 *                 image:
 *                    type: string
 *                    example: "dsdsaffds.jpg"
 *                 role:
 *                    type: number
 *                    example: 0
 *                 cart:
 *                    type: number
 *                    example: 1
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
 *                   example: User successfully registered!
 *       401:
 *         description: Unauthorized - User not registered
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
 *                   example: Login successful!
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                          id:
 *                              type: number
 *                              example: 2
 *                          name:
 *                              type: string
 *                              example: Test
 *                          email:
 *                              type: string
 *                              example: test@yopmail.com
 *                          image:
 *                              type: string
 *                              example: "dsdsaffds.jpg"
 *                          role:
 *                              type: number
 *                              example: 0
 *                          cart:
 *                              type: number
 *                              example: 2
 *       401:
 *         description: Unauthorized - User not logged in
 */
authRouter.route("/signin").post(signin);

authRouter.route("/send-otp").post(sendOtpMail);

authRouter.route("/verify-otp").post(verifyOtp);

authRouter.route("/update-password").post(updatePassword);

authRouter.get("/roles", getAllRoles);

authRouter.use(validateToken);

authRouter.get("/monitors", sendMonitoringDetails);

authRouter.get("/:userId", getAllUsers);

authRouter.delete("/:id", deleteUserById);

export default authRouter;
