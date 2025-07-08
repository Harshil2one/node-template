import express from "express";
import fileController from "../controllers/file.controller";
const fileRouter = express.Router();

const { readFile, appendFile, writeFile, deleteFile, renameFile } = fileController;

fileRouter.route("/read-file").post(readFile);
fileRouter.route("/append-file").post(appendFile);
fileRouter.route("/write-file").post(writeFile);
fileRouter.route("/delete-file").delete(deleteFile);
fileRouter.route("/rename-file").post(renameFile);

export default fileRouter;
