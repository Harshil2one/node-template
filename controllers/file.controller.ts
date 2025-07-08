import { Request, Response, RequestHandler, NextFunction } from "express";
import { HTTP_STATUS } from "../enums/status.enum";
import { APIResponse } from "../helpers/apiResponse";

const fs = require("fs");

const readFile: RequestHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const reqBody = await request.body;
    const { file } = reqBody;
    let fileData = "";
    fs.readFile(`./${file}.txt`, "utf8", (err: any, data: any) => {
      if (err) {
        console.error("Error reading file:", err);
        return;
      }
      fileData = data;
    });
    setTimeout(() => {
      APIResponse(
        response,
        true,
        HTTP_STATUS.SUCCESS,
        "Index File readed successfully..!",
        fileData
      );
    }, 500);
  } catch (error: unknown) {
    if (error) {
      APIResponse(response, false, HTTP_STATUS.BAD_REQUEST, error as string);
    } else {
      return next(error);
    }
  }
};

const appendFile: RequestHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const reqBody = await request.body;
    const { file, content } = reqBody;
    fs.appendFile(
      `./${file}.txt`,
      `\n${content}\n`,
      "utf8",
      (err: any, data: any) => {
        if (err) {
          console.error("Error writing file:", err);
          return;
        }
      }
    );
    APIResponse(
      response,
      true,
      HTTP_STATUS.SUCCESS,
      "Index File content updated successfully..!"
    );
  } catch (error: unknown) {
    if (error) {
      APIResponse(response, false, HTTP_STATUS.BAD_REQUEST, error as string);
    } else {
      return next(error);
    }
  }
};

const writeFile: RequestHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const reqBody = await request.body;
    const { file, content } = reqBody;
    fs.writeFile(
      `./${file}.txt`,
      `${content}\n`,
      "utf8",
      (err: any, data: any) => {
        if (err) {
          console.error("Error writing file:", err);
          return;
        }
      }
    );
    APIResponse(
      response,
      true,
      HTTP_STATUS.SUCCESS,
      "Index File content replaced successfully..!"
    );
  } catch (error: unknown) {
    if (error) {
      APIResponse(response, false, HTTP_STATUS.BAD_REQUEST, error as string);
    } else {
      return next(error);
    }
  }
};

const deleteFile: RequestHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const { file } = await request.query;
    fs.unlink(`./${file}.txt`, (err: any) => {
      if (err) {
        console.error(err);
        return;
      }
    });
    APIResponse(
      response,
      true,
      HTTP_STATUS.SUCCESS,
      "Index File deleted successfully..!"
    );
  } catch (error: unknown) {
    if (error) {
      APIResponse(response, false, HTTP_STATUS.BAD_REQUEST, error as string);
    } else {
      return next(error);
    }
  }
};

const renameFile: RequestHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const reqBody = await request.body;
    const { oldName, newName } = reqBody;
    fs.rename(`./${oldName}.txt`, `./${newName}.txt`, (err: any) => {
      if (err) {
        console.log(err);
      } else {
        console.log("Renamed!");
      }
    });
    APIResponse(
      response,
      true,
      HTTP_STATUS.SUCCESS,
      "Index File renamed successfully..!"
    );
  } catch (error: unknown) {
    if (error) {
      APIResponse(response, false, HTTP_STATUS.BAD_REQUEST, error as string);
    } else {
      return next(error);
    }
  }
};

export default { readFile, appendFile, writeFile, deleteFile, renameFile };
