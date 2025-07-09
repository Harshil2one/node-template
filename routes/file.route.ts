import express from "express";
import fileController from "../controllers/file.controller";
const fileRouter = express.Router();

const { readFile, appendFile, writeFile, deleteFile, renameFile } =
  fileController;

/**
 * @openapi
 * /v1/api/read-file:
 *   post:
 *     summary: Read file content
 *     requestBody:
 *       required: true
 *       content:
 *          application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 file:
 *                    type: string
 *                    example: index
 *     description: Read index file content.
 *     operationId: readFile
 *     tags:
 *       - Files
 *     responses:
 *       200:
 *         description: Successfully read
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
 *                   example: Index File readed successfully..!
 *                 data:
 *                   type: string
 *                   example: Replace whole content\n
 *       401:
 *         description: Unauthorized - User can not read file
 *     servers:
 *       - url: http://localhost:8000
 *         description: Local development server
 */
fileRouter.route("/read-file").post(readFile);

/**
 * @openapi
 * /v1/api/append-file:
 *   post:
 *     summary: Update file content
 *     requestBody:
 *       required: true
 *       content:
 *          application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 file:
 *                    type: string
 *                    example: index
 *                 content:
 *                    type: string
 *                    example: Append new content
 *     description: Update index file content.
 *     operationId: appendFile
 *     tags:
 *       - Files
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
 *                   example: Index File content updated successfully..!
 *       401:
 *         description: Unauthorized - User can not update file
 *     servers:
 *       - url: http://localhost:8000
 *         description: Local development server
 */
fileRouter.route("/append-file").post(appendFile);

/**
 * @openapi
 * /v1/api/write-file:
 *   post:
 *     summary: Replace file content
 *     requestBody:
 *       required: true
 *       content:
 *          application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 file:
 *                    type: string
 *                    example: index
 *                 content:
 *                    type: string
 *                    example: Replace whole content
 *     description: Replace index file content.
 *     operationId: writeFile
 *     tags:
 *       - Files
 *     responses:
 *       200:
 *         description: Successfully replaced
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
 *                   example: Index File content replaced successfully..!
 *       401:
 *         description: Unauthorized - User can not replace file content
 *     servers:
 *       - url: http://localhost:8000
 *         description: Local development server
 */
fileRouter.route("/write-file").post(writeFile);

/**
 * @openapi
 * /v1/api/delete-file?file=index:
 *   delete:
 *     summary: Delete file
 *     description: Delete index file.
 *     operationId: deleteFile
 *     tags:
 *       - Files
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
 *                   example: Index File deleted successfully..!
 *       401:
 *         description: Unauthorized - User can not delete file
 *     servers:
 *       - url: http://localhost:8000
 *         description: Local development server
 */
fileRouter.route("/delete-file").delete(deleteFile);

/**
 * @openapi
 * /v1/api/rename-file:
 *   post:
 *     summary: Rename file
 *     requestBody:
 *       required: true
 *       content:
 *          application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 oldName:
 *                    type: string
 *                    example: index
 *                 newName:
 *                    type: string
 *                    example: new-name
 *     description: Rename file.
 *     operationId: renameFile
 *     tags:
 *       - Files
 *     responses:
 *       200:
 *         description: Successfully renamed
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
 *                   example: Index File renamed successfully..!
 *       401:
 *         description: Unauthorized - User can not rename file
 *     servers:
 *       - url: http://localhost:8000
 *         description: Local development server
 */
fileRouter.route("/rename-file").post(renameFile);

export default fileRouter;
