import { Request, Response, RequestHandler, NextFunction } from "express";
import { HTTP_STATUS } from "../enums/status.enum";
import { APIResponse } from "../helpers/apiResponse";

const os = require("os");

const getOSDetails: RequestHandler = async (
  _request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const data = {
      platform: os.platform(),
      type: os.type(),
      release: os.release(),
      architecture: os.arch(),
      host: os.hostname(),
      memory: os.totalmem(),
      free: os.freemem(),
      home: os.homedir(),
      version: os.version(),
      userInfo: os.userInfo(),
      temp: os.tmpdir(),
      "CPU cores": os.cpus(),
      "Load avg": os.loadavg(),
      upTime: os.uptime(),
    };

    APIResponse(
      response,
      true,
      HTTP_STATUS.SUCCESS,
      "OS details fetched successfully..!",
      data
    );
  } catch (error: unknown) {
    if (error) {
      APIResponse(response, false, HTTP_STATUS.BAD_REQUEST, error as string);
    } else {
      return next(error);
    }
  }
};

export default { getOSDetails };
