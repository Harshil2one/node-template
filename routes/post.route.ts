import express from "express";
import postController from "../controllers/post.controller";
const postRouter = express.Router();

const { getPosts } = postController;

postRouter.route("/posts").get(getPosts);

export default postRouter;
