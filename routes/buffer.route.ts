import express from "express";
import bufferController from "../controllers/buffer.controller";
const bufferRouter = express.Router();

const { createEmptyBuffer, createBuffer } = bufferController;

bufferRouter.route("/empty-buffer").get(createEmptyBuffer);
bufferRouter.route("/create-buffer").get(createBuffer);

export default bufferRouter;
