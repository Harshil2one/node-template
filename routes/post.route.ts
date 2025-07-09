import express from "express";
import postController from "../controllers/post.controller";
const postRouter = express.Router();

const { getPosts, getPostById, createPost, updatePost, deletePostById } = postController;

/**
 * @openapi
 * /v1/api/posts:
 *   get:
 *     summary: Get all posts
 *     description: Fetch all posts
 *     operationId: getPosts
 *     tags:
 *       - Posts
 *     responses:
 *       200:
 *         description: Successfully fetch all posts
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
 *                   example: Posts fetched successfully..!
 *       401:
 *         description: Unauthorized - User can not get posts
 *     servers:
 *       - url: http://localhost:8000
 *         description: Local development server
 */
postRouter.route("/posts").get(getPosts);

/**
 * @openapi
 * /v1/api/post/2:
 *   get:
 *     summary: Get post details
 *     description: Fetch post details.
 *     operationId: getPostDetails
 *     tags:
 *       - Posts
 *     responses:
 *       200:
 *         description: Successfully fetch post details
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
 *                   example: Post details fetched successfully..!
 *                 data:
 *                   type: object
 *                   properties:
 *                      id:
 *                         type: number
 *                         example: 2
 *                      title:
 *                         type: string
 *                         example: Test 0
 *                      description:
 *                         type: string
 *                         example: test description 0
 *                      author:
 *                         type: string
 *                         example: Harshil Babariya
 *                      created_at:
 *                         type: string
 *                         example: 08-07-2025
 *       401:
 *         description: Unauthorized - User can not get post details
 *     servers:
 *       - url: http://localhost:8000
 *         description: Local development server
 */
postRouter.route("/post/:id").get(getPostById);

/**
 * @openapi
 * /v1/api/post:
 *   post:
 *     summary: Create post
 *     requestBody:
 *       required: true
 *       content:
 *          application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 title:
 *                    type: string
 *                    example: Test 2
 *                 description:
 *                    type: string
 *                    example: test description 2
 *                 author:
 *                    type: string
 *                    example: Harshil Babariya
 *                 created_at:
 *                    type: string
 *                    example: 08-07-2025
 *     description: Create new post
 *     operationId: createPost
 *     tags:
 *       - Posts
 *     responses:
 *       200:
 *         description: Successfully created
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
 *                   example: Post created successfully..!
 *       401:
 *         description: Unauthorized - User can not create post
 *     servers:
 *       - url: http://localhost:8000
 *         description: Local development server
 */
postRouter.route("/post").post(createPost);

/**
 * @openapi
 * /v1/api/post/4:
 *   put:
 *     summary: Update post
 *     requestBody:
 *       required: true
 *       content:
 *          application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 title:
 *                    type: string
 *                    example: Test 2
 *                 description:
 *                    type: string
 *                    example: test description 2
 *                 author:
 *                    type: string
 *                    example: Harshil Babariya
 *                 created_at:
 *                    type: string
 *                    example: 08-07-2025
 *     description: Update post details
 *     operationId: updatePost
 *     tags:
 *       - Posts
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
 *                   example: Post updated successfully..!
 *       401:
 *         description: Unauthorized - User can not update post
 *     servers:
 *       - url: http://localhost:8000
 *         description: Local development server
 */
postRouter.route("/post/:id").put(updatePost);

/**
 * @openapi
 * /v1/api/post/2:
 *   delete:
 *     summary: Delete post
 *     description: Delete post.
 *     operationId: deletePostById
 *     tags:
 *       - Posts
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
 *                   example: Post deleted successfully..!
 *       401:
 *         description: Unauthorized - User can not delete post
 *     servers:
 *       - url: http://localhost:8000
 *         description: Local development server
 */
postRouter.route("/post/:id").delete(deletePostById);

export default postRouter;
