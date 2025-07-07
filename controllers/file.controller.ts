import { Request, Response, RequestHandler, NextFunction } from "express";
import { HTTP_STATUS } from "../enums/status.enum";
import { APIResponse } from "../helpers/apiResponse";

const fs = require("fs");

const readFile: RequestHandler = async (
  _request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    fs.readFile("./index.txt", "utf8", (err: any, data: any) => {
      if (err) {
        console.error("Error reading file:", err);
        return;
      }
      console.log("File content:", data);
    });
    APIResponse(
      response,
      true,
      HTTP_STATUS.SUCCESS,
      "Index File readed successfully..!"
    );
  } catch (error: unknown) {
    if (error) {
      APIResponse(response, false, HTTP_STATUS.BAD_REQUEST, error as string);
    } else {
      return next(error);
    }
  }
};

const appendFile: RequestHandler = async (
  _request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    fs.appendFile(
      "./index.txt",
      "\nNew content is added\n",
      "utf8",
      (err: any, data: any) => {
        if (err) {
          console.error("Error writing file:", err);
          return;
        }
        console.log("Updated file content:", data);
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
  _request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    fs.writeFile(
      "./index.txt",
      "\nNew content is added\n",
      "utf8",
      (err: any, data: any) => {
        if (err) {
          console.error("Error writing file:", err);
          return;
        }
        console.log("Replaced file content:", data);
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
  _request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    fs.unlink("./index.txt");
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
  _request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    fs.rename("./index.txt", "./new-file.txt");
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
