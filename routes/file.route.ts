import express from "express";
import fileController from "../controllers/file.controller";
const fileRouter = express.Router();

const { readFile, appendFile, writeFile, deleteFile, renameFile } = fileController;

fileRouter.route("/read-file").get(readFile);
fileRouter.route("/append-file").get(appendFile);
fileRouter.route("/write-file").get(writeFile);
fileRouter.route("/delete-file").get(deleteFile);
fileRouter.route("/rename-file").get(renameFile);

export default fileRouter;
