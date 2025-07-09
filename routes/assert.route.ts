import express from "express";
import assertController from "../controllers/assert.controller";
const assertRouter = express.Router();

const { compare } = assertController;

/**
 * @openapi
 * /v1/api/compare-assert:
 *   get:
 *     summary: Compare asserts
 *     description: Just for use cases understanding.
 *     operationId: compareAsserts
 *     tags:
 *       - Assert
 *     responses:
 *       200:
 *         description: Successfully compare asserts
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
 *                   example: Assert compared successfully..!
 *       401:
 *         description: Unauthorized - User can not compare asserts
 *     servers:
 *       - url: http://localhost:8000
 *         description: Local development server
 */
assertRouter.route("/compare-assert").get(compare);

export default assertRouter;
