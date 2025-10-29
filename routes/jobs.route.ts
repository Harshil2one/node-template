import express from "express";
import { validateToken } from "../middlewares/auth.middleware";
import jobsController from "../controllers/jobs.controller";
const jobRouter = express.Router();

const { getAllJobs, getJobById, createJob, updateJob, deleteJobById } = jobsController;

jobRouter.use(validateToken);

jobRouter.route("/").get(getAllJobs);

jobRouter.get("/:id", getJobById);

jobRouter.post("/", createJob);

jobRouter.put("/:id", updateJob);

jobRouter.delete("/:id", deleteJobById);

export default jobRouter;
