import { Request, Response, RequestHandler, NextFunction } from "express";
import { HTTP_STATUS } from "../enums/status.enum";
import { APIResponse } from "../helpers/apiResponse";
import db from "../config/db.config";
import { INotification } from "../models/notifications.model";

const getAllNotifications: RequestHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const { receiverId } = request.params;
  try {
    const [notifications] = (await db.query(
      "SELECT * FROM notifications WHERE JSON_CONTAINS(receiver, JSON_ARRAY(?)) AND mark_as_read = 0 ORDER BY id DESC",
      [Number(receiverId)]
    )) as unknown as [INotification];

    if (!notifications) {
      return APIResponse(
        response,
        false,
        HTTP_STATUS.BAD_REQUEST,
        "No notifications available!"
      );
    }

    APIResponse(
      response,
      true,
      HTTP_STATUS.SUCCESS,
      "Notifications fetched successfully!",
      notifications
    );
  } catch (error: unknown) {
    if (error) {
      APIResponse(response, false, HTTP_STATUS.BAD_REQUEST, error as string);
    } else {
      return next(error);
    }
  }
};

const markAsReadNotification: RequestHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const { notificationId } = request.params;

    const [notifications] = (await db.query(
      "UPDATE notifications SET mark_as_read = ? WHERE id = ?",
      [1, notificationId]
    )) as unknown as [INotification];

    if (notifications)
      APIResponse(
        response,
        true,
        HTTP_STATUS.SUCCESS,
        "Notification mark as read!"
      );
  } catch (error: unknown) {
    if (error) {
      APIResponse(response, false, HTTP_STATUS.BAD_REQUEST, error as string);
    } else {
      return next(error);
    }
  }
};

const markAllAsRead: RequestHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const { receiverId } = request.params;
  try {
    const [notification] = (await db.query(
      "UPDATE notifications SET mark_as_read = ? WHERE JSON_CONTAINS(receiver, JSON_ARRAY(?))",
      [1, [Number(receiverId)]]
    )) as unknown as [INotification];

    if (notification)
      APIResponse(
        response,
        true,
        HTTP_STATUS.SUCCESS,
        "Notifications mark as read!"
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
  getAllNotifications,
  markAsReadNotification,
  markAllAsRead,
};
