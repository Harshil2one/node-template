import { Request, Response, RequestHandler, NextFunction } from "express";
import { HTTP_STATUS } from "../enums/status.enum";
import { APIResponse } from "../helpers/apiResponse";
import db from "../config/db.config";
import { IChat } from "../models/chat.model";

const getMessages: RequestHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const { userId } = await request.params;
    const [[chats]] = (await db.query("SELECT * FROM chats WHERE userId = ?", [
      userId,
    ])) as unknown as [[IChat]];

    if (!chats) {
      return APIResponse(
        response,
        false,
        HTTP_STATUS.BAD_REQUEST,
        "No chats found!"
      );
    }

    APIResponse(
      response,
      true,
      HTTP_STATUS.SUCCESS,
      "Messages fetched successfully!",
      chats
    );
  } catch (error: unknown) {
    if (error) {
      APIResponse(response, false, HTTP_STATUS.BAD_REQUEST, error as string);
    } else {
      return next(error);
    }
  }
};

const sendMessage: RequestHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const { userId } = await request.params;
    const { message, reply } = await request.body;
    const [[chat]] = (await db.query("SELECT * FROM chats WHERE userId = ?", [
      userId,
    ])) as unknown as [[IChat]];

    if (!chat) {
      const [newChat] = (await db.query(
        "INSERT into chats (userId, messages) VALUES (?, ?)",
        [
          userId,
          JSON.stringify([
            {
              type: "bot",
              message: `Hi, I am your assistant to help you.`,
            },
            { type: "user", message },
            { type: "bot", message: reply },
          ]),
        ]
      )) as unknown as [IChat];
      if (!newChat) {
        return APIResponse(
          response,
          false,
          HTTP_STATUS.BAD_REQUEST,
          "Something went wrong!"
        );
      }
      return APIResponse(response, true, HTTP_STATUS.SUCCESS, reply);
    } else {
      const [updateChat] = (await db.query(
        "UPDATE chats SET messages = ? WHERE userId = ?",
        [
          JSON.stringify([
            ...(chat.messages
              ? chat.messages
              : [
                  {
                    type: "bot",
                    message: `Hi, I am your assistant to help you.`,
                  },
                ]),
            { type: "user", message },
            { type: "bot", message: reply },
          ]),
          userId,
        ]
      )) as unknown as [IChat];
      if (!updateChat) {
        return APIResponse(
          response,
          false,
          HTTP_STATUS.BAD_REQUEST,
          "Something went wrong!"
        );
      }
      return APIResponse(response, true, HTTP_STATUS.SUCCESS, reply);
    }
  } catch (error: unknown) {
    if (error) {
      APIResponse(response, false, HTTP_STATUS.BAD_REQUEST, error as string);
    } else {
      return next(error);
    }
  }
};

const restartChat: RequestHandler = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const { userId } = await request.params;
      const [chat] = (await db.query("UPDATE chats SET messages = NULL WHERE userId = ?", [
        userId,
      ])) as unknown as [IChat];
  
      if (!chat) {
        return APIResponse(
          response,
          false,
          HTTP_STATUS.BAD_REQUEST,
          "No chats found!"
        );
      }
  
      APIResponse(
        response,
        true,
        HTTP_STATUS.SUCCESS,
        "Chat restarted!",
      );
    } catch (error: unknown) {
      if (error) {
        APIResponse(response, false, HTTP_STATUS.BAD_REQUEST, error as string);
      } else {
        return next(error);
      }
    }
  };

export default { getMessages, sendMessage, restartChat };
