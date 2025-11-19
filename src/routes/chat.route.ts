import express from "express";
import chatController from "../controllers/chat.controller";

const chatRouter = express.Router();

const { getMessages, sendMessage, restartChat } = chatController;

chatRouter.get("/messages/:userId", getMessages);

chatRouter.post("/messages/:userId", sendMessage);

chatRouter.delete("/restart/:userId", restartChat);

export default chatRouter;
