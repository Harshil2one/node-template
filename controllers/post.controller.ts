import { Request, Response, RequestHandler, NextFunction } from "express";
import { HTTP_STATUS } from "../enums/status.enum";
import { APIResponse } from "../helpers/apiResponse";
import db from "../config/db.config";

const getPosts: RequestHandler = async (
  _request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const [posts] = await db.query("SELECT * FROM posts");

    APIResponse(
      response,
      true,
      HTTP_STATUS.SUCCESS,
      "Posts fetched successfully..!",
      posts
    );
  } catch (error: unknown) {
    if (error) {
      APIResponse(response, false, HTTP_STATUS.BAD_REQUEST, error as string);
    } else {
      return next(error);
    }
  }
};

const getPostById: RequestHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const { id } = await request.params;
  try {
    const [post] = await db.query("SELECT * FROM posts WHERE id = ?", id);

    APIResponse(
      response,
      true,
      HTTP_STATUS.SUCCESS,
      "Post details fetched successfully..!",
      post
    );
  } catch (error: unknown) {
    if (error) {
      APIResponse(response, false, HTTP_STATUS.BAD_REQUEST, error as string);
    } else {
      return next(error);
    }
  }
};

const createPost: RequestHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const { title, description, author, created_at } = await request.body;
  try {
    const [post]: any = await db.query(
      "INSERT INTO posts (title, description, author, created_at) VALUES (?, ?, ?, ?)",
      [title, description, author, created_at]
    );

    if (post.affectedRows === 0) {
      APIResponse(
        response,
        false,
        HTTP_STATUS.INTERNAL_SERVER,
        "Something wrong happened!"
      );
      return;
    }

    APIResponse(
      response,
      true,
      HTTP_STATUS.SUCCESS,
      "Post created successfully..!",
      post
    );
  } catch (error: unknown) {
    if (error) {
      APIResponse(response, false, HTTP_STATUS.BAD_REQUEST, error as string);
    } else {
      return next(error);
    }
  }
};

const updatePost: RequestHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const { id } = await request.params;
  const { title, description, author, created_at } = await request.body;

  
  try {
    const [post]: any = await db.query(
      "UPDATE posts SET title = ?, description = ?, author = ?, created_at = ? WHERE id = ?",
      [title, description, author, created_at, id]
    );

    if (post.affectedRows === 0) {
      APIResponse(
        response,
        false,
        HTTP_STATUS.INTERNAL_SERVER,
        "Something wrong happened!"
      );
      return;
    }

    APIResponse(
      response,
      true,
      HTTP_STATUS.SUCCESS,
      "Post details updated successfully..!",
      post
    );
  } catch (error: unknown) {
    if (error) {
      APIResponse(response, false, HTTP_STATUS.BAD_REQUEST, error as string);
    } else {
      return next(error);
    }
  }
};

const deletePostById: RequestHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const { id } = await request.params;
  try {
    const [post]: any = await db.query("DELETE FROM posts WHERE id = ?", id);

    if (post.affectedRows === 0) {
      APIResponse(response, false, HTTP_STATUS.NOT_FOUND, "Post not found!");
      return;
    }
    APIResponse(
      response,
      true,
      HTTP_STATUS.SUCCESS,
      "Post deleted successfully..!",
      post
    );
  } catch (error: unknown) {
    if (error) {
      APIResponse(response, false, HTTP_STATUS.BAD_REQUEST, error as string);
    } else {
      return next(error);
    }
  }
};

export default {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePostById,
};
