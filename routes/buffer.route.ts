import express from "express";
import bufferController from "../controllers/buffer.controller";
const bufferRouter = express.Router();

const { createEmptyBuffer, createBuffer } = bufferController;

/**
 * @openapi
 * /v1/api/empty-buffer?size=10:
 *   get:
 *     summary: Create empty buffer
 *     description: Just for use cases understanding.
 *     operationId: emptyBuffer
 *     tags:
 *       - Buffers
 *     responses:
 *       200:
 *         description: Successfully created empty buffer
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
 *                   example: Empty buffer with size of 10 created successfully..!
 *                 data:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                          type:
 *                              type: string
 *                              example: Buffer
 *       401:
 *         description: Unauthorized - User can not create empty buffer
 *     servers:
 *       - url: http://localhost:8000
 *         description: Local development server
 */
bufferRouter.route("/empty-buffer").get(createEmptyBuffer);

/**
 * @openapi
 * /v1/api/create-buffer?content=test:
 *   get:
 *     summary: Create buffer from content
 *     description: Just for use cases understanding.
 *     operationId: createBuffer
 *     tags:
 *       - Buffers
 *     responses:
 *       200:
 *         description: Successfully created buffer from content
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
 *                   example: Buffer created and fetched successfully..!
 *                 data:
 *                   type: object
 *                   properties:
 *                      content:
 *                         type: string
 *                         example: test
 *                      length:
 *                         type: number
 *                         example: 4
 *                      ASCI:
 *                         type: number
 *                         example: 116
 *       401:
 *         description: Unauthorized - User can not create buffer from content
 *     servers:
 *       - url: http://localhost:8000
 *         description: Local development server
 */
bufferRouter.route("/create-buffer").get(createBuffer);

export default bufferRouter;
