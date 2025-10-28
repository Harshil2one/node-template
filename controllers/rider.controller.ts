import { Request, Response, RequestHandler, NextFunction } from "express";
import { HTTP_STATUS } from "../enums/status.enum";
import { APIResponse } from "../helpers/apiResponse";
import db from "../config/db.config";
import { IRider } from "../models/rider.model";

const getAllRequests: RequestHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const [requests] = (await db.query("SELECT * FROM riders")) as unknown as [
      IRider
    ];

    if (!requests) {
      return APIResponse(
        response,
        false,
        HTTP_STATUS.BAD_REQUEST,
        "No rider requests available!"
      );
    }

    APIResponse(
      response,
      true,
      HTTP_STATUS.SUCCESS,
      "Rider requests fetched successfully!",
      requests
    );
  } catch (error: unknown) {
    if (error) {
      APIResponse(response, false, HTTP_STATUS.BAD_REQUEST, error as string);
    } else {
      return next(error);
    }
  }
};

const registerRider: RequestHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const { name, city, contact } = await request.body;
  try {
    const [rider] = (await db.query(
      "INSERT INTO riders (name, city, contact) VALUES (?, ?, ?)",
      [name, city, contact]
    )) as unknown as [IRider];

    if (rider.affectedRows === 0) {
      APIResponse(
        response,
        false,
        HTTP_STATUS.INTERNAL_SERVER,
        "Something wrong happened!"
      );
      return;
    }

    const client = require("twilio")(
      process.env.TWILIO_SID,
      process.env.TWILIO_TOKEN
    );
    const body =
      "We've received your Bigbite rider request. Our team will go through it. Once they confirm you'll receive confirmation from our side. It may take 1-2 working days to proceed. Please contact us if you do not receive updates!";

    client.messages.create({
      body,
      messagingServiceSid: process.env.TWILIO_MESSAGE_SID,
      to: "+91" + rider.contact,
    });
    APIResponse(response, true, HTTP_STATUS.SUCCESS, "Rider request sent!");
  } catch (error: unknown) {
    if (error) {
      APIResponse(response, false, HTTP_STATUS.BAD_REQUEST, error as string);
    } else {
      return next(error);
    }
  }
};

const updateRiderRequest: RequestHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const { id } = request.params;
  const { status } = await request.body;
  try {
    const [[existingRequest]] = (await db.query(
      "SELECT * FROM riders WHERE id = ?",
      [id]
    )) as unknown as [[IRider]];

    if (!existingRequest) {
      APIResponse(
        response,
        false,
        HTTP_STATUS.INTERNAL_SERVER,
        "Rider request not found!"
      );
      return;
    }

    const [request] = (await db.query(
      "UPDATE riders SET status = ? WHERE id = ?",
      [status, id]
    )) as unknown as [IRider];

    if (request.affectedRows === 0) {
      APIResponse(
        response,
        false,
        HTTP_STATUS.INTERNAL_SERVER,
        "Something wrong happened!"
      );
      return;
    }

    const client = require("twilio")(
      process.env.TWILIO_SID,
      process.env.TWILIO_TOKEN
    );
    const body =
      status === "approved"
        ? "Congratulations! Your Bigbite rider request has been approved. You got further instructions from our team soon. Please provide your residential address when our executive calls you so we can provide you startup kit. THANK YOU!"
        : "We're sorry to let you know that you are not able to work with us as of now. We will be in touch incase of further riders are needed. THANK YOU!";

    client.messages
      .create({
        body,
        messagingServiceSid: process.env.TWILIO_MESSAGE_SID,
        to: "+91" + existingRequest.contact,
      })
      .then((message: any) =>
        APIResponse(
          response,
          true,
          HTTP_STATUS.SUCCESS,
          `Request has been ${status}!`,
          { code: message.sid }
        )
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
  getAllRequests,
  registerRider,
  updateRiderRequest,
};
