import { Request, Response, RequestHandler, NextFunction } from "express";
import { HTTP_STATUS } from "../enums/status.enum";
import { APIResponse } from "../helpers/apiResponse";
import db from "../config/db.config";
import { IJob } from "../models/jobs.model";

const getAllJobs: RequestHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const [jobs] = (await db.query("SELECT * FROM jobs")) as unknown as [
      IJob
    ];

    if (!jobs) {
      return APIResponse(
        response,
        false,
        HTTP_STATUS.BAD_REQUEST,
        "No jobs available!"
      );
    }

    APIResponse(
      response,
      true,
      HTTP_STATUS.SUCCESS,
      "Jobs fetched successfully!",
      jobs
    );
  } catch (error: unknown) {
    if (error) {
      APIResponse(response, false, HTTP_STATUS.BAD_REQUEST, error as string);
    } else {
      return next(error);
    }
  }
};

const getJobById: RequestHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const { id } = await request.params;
  try {
    const [[job]] = (await db.query(
      "SELECT * FROM jobs WHERE id = ?",
      id
    )) as unknown as [[IJob]];

    APIResponse(
      response,
      true,
      HTTP_STATUS.SUCCESS,
      "Job details fetched successfully!",
      job
    );
  } catch (error: unknown) {
    if (error) {
      APIResponse(response, false, HTTP_STATUS.BAD_REQUEST, error as string);
    } else {
      return next(error);
    }
  }
};

const createJob: RequestHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const { title, location, isActive = 0 } = await request.body;
  try {
    const [job] = (await db.query(
      "INSERT INTO jobs (title, location, isActive) VALUES (?, ?, ?)",
      [title, location, isActive]
    )) as unknown as [IJob];

    if (job.affectedRows === 0) {
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
      "Job created successfully!",
      job
    );
  } catch (error: unknown) {
    if (error) {
      APIResponse(response, false, HTTP_STATUS.BAD_REQUEST, error as string);
    } else {
      return next(error);
    }
  }
};

const updateJob: RequestHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const { id } = await request.params;
  const { title, location, isActive = 0 } = await request.body;

  try {
    const [job] = (await db.query(
      "UPDATE jobs SET title = ?, location = ?, isActive = ? WHERE id = ?",
      [title, location, isActive, id]
    )) as unknown as [IJob];

    if (job.affectedRows === 0) {
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
      "Job updated successfully!"
    );
  } catch (error: unknown) {
    if (error) {
      APIResponse(response, false, HTTP_STATUS.BAD_REQUEST, error as string);
    } else {
      return next(error);
    }
  }
};

const deleteJobById: RequestHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const { id } = await request.params;
  try {
    const [job] = (await db.query(
      "DELETE FROM jobs WHERE id = ?",
      id
    )) as unknown as [IJob];

    APIResponse(
      response,
      true,
      HTTP_STATUS.SUCCESS,
      "Job deleted successfully!",
      job
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
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJobById,
};
