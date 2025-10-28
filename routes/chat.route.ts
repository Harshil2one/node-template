import express from "express";
import chatController from "../controllers/chat.controller";

const chatRouter = express.Router();

const { getMessages, sendMessage } = chatController;

chatRouter.get("/messages/:userId", getMessages);

chatRouter.post("/messages/:userId", sendMessage);

export default chatRouter;
