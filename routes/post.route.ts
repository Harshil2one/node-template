import express from "express";
import postController from "../controllers/post.controller";
const postRouter = express.Router();

const { getPosts, getPostById, createPost, updatePost, deletePostById } = postController;

postRouter.route("/posts").get(getPosts);
postRouter.route("/post/:id").get(getPostById);
postRouter.route("/post").post(createPost);
postRouter.route("/post/:id").put(updatePost);
postRouter.route("/post/:id").delete(deletePostById);

export default postRouter;
