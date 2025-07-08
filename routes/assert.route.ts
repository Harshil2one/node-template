import express from "express";
import assertController from "../controllers/assert.controller";
const assertRouter = express.Router();

const { compare } = assertController;

assertRouter.route("/compare-assert").get(compare);

export default assertRouter;
