import express from "express";
import osController from "../controllers/os.controller";
const osRouter = express.Router();

const { getOSDetails } = osController;

/**
 * @openapi
 * /v1/api/get-os-details:
 *   get:
 *     summary: Get OS details
 *     description: Just for use cases understanding.
 *     operationId: getOsDetails
 *     tags:
 *       - OS
 *     responses:
 *       200:
 *         description: Successfully fetch operating system details
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
 *                   example: OS details fetched successfully..!
 *                 data:
 *                   type: object
 *                   properties:
 *                      platform:
 *                         type: string
 *                         example: win32
 *                      type:
 *                         type: string
 *                         example: Windows_NT
 *                      release:
 *                         type: string
 *                         example: 10.0.26100
 *                      architecture:
 *                         type: string
 *                         example: x64
 *                      host:
 *                         type: string
 *                         example: PCLPI63
 *                      memory:
 *                         type: number
 *                         example: 16849293312
 *                      free:
 *                         type: number
 *                         example: 2165121024
 *                      home:
 *                         type: string
 *                         example: C:\\Users\\LPI63
 *                      version:
 *                         type: string
 *                         example: Windows 11 Home Single Language
 *       401:
 *         description: Unauthorized - User can not get OS details
 *     servers:
 *       - url: http://localhost:8000
 *         description: Local development server
 */
osRouter.route("/get-os-details").get(getOSDetails);

export default osRouter;
