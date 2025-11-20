import express from "express";
import profileController from "../controllers/profile.controller";
import { validateToken } from "../middlewares/auth.middleware";

const profileRouter = express.Router();

const { getProfile, updateProfile, updateProfileAddress, deleteAccount } =
  profileController;

profileRouter.use(validateToken);

/**
 * @openapi
 * /v1/api/profile/:id:
 *   get:
 *     summary: Get logged in user profile
 *     description: Fetch logged in user profile
 *     operationId: getProfile
 *     tags:
 *       - Profile
 *     responses:
 *       200:
 *         description: Successfully fetch logged in user profile details
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
 *                   example: Profile details fetched successfully!
 *       401:
 *         description: Unauthorized - User can not fetched
 *     servers:
 *       - url: http://localhost:8000
 *         description: Local development server
 */
profileRouter.route("/:id").get(getProfile);

/**
 * @openapi
 * /v1/api/profile/:id:
 *   profile:
 *     summary: Update profile
 *     requestBody:
 *       required: true
 *       content:
 *          application/json:
 *             schema:
 *               type: object
 *     description: Update user profile
 *     operationId: updateProfile
 *     tags:
 *       - Profile
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
 *                   example: Profile details updated successfully!
 *       401:
 *         description: Unauthorized - User can not get updated
 *     servers:
 *       - url: http://localhost:8000
 *         description: Local development server
 */
profileRouter.route("/:id").patch(updateProfile);

/**
 * @openapi
 * /v1/api/profile/address/:id:
 *   profile:
 *     summary: Update address
 *     requestBody:
 *       required: true
 *       content:
 *          application/json:
 *             schema:
 *               type: object
 *     description: Update user address
 *     operationId: updateProfileAddress
 *     tags:
 *       - Profile adress
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
 *                   example: Address details updated successfully!
 *       401:
 *         description: Unauthorized - User can not get updated
 *     servers:
 *       - url: http://localhost:8000
 *         description: Local development server
 */
profileRouter.route("/address/:id").patch(updateProfileAddress);

profileRouter.delete("/delete-account/:id", deleteAccount);

export default profileRouter;
