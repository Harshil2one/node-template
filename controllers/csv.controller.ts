import { Request, Response, RequestHandler, NextFunction } from "express";
import { HTTP_STATUS } from "../enums/status.enum";
import { APIResponse } from "../helpers/apiResponse";
import db from "../config/db.config";
import csvParser from "csv-parser";

const fs = require("fs");

const downloadSampleCsv: RequestHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const csvHeaders = [
      "name",
      "description",
      "image",
      "price",
      "type",
      "ratings",
      "ratingsCount",
      "isBest",
    ];

    const sampleData = [
      [
        "Cheese Burger",
        "Juicy grilled burger with melted cheese",
        "https://example.com/images/burger.jpg",
        149,
        "non-veg",
        0,
        0,
        1,
      ],
      [
        "Paneer Roll",
        "Spicy paneer wrapped in soft roti",
        "https://example.com/images/paneer-roll.jpg",
        129,
        "veg",
        0,
        0,
        0,
      ],
    ];

    const csvContent = [
      csvHeaders.join(","),
      ...sampleData.map((row) => row.map((value) => `"${value}"`).join(",")),
    ].join("\n");

    response.setHeader("Content-Type", "text/csv");
    response.setHeader(
      "Content-Disposition",
      "attachment; filename=sample_food_items.csv"
    );

    APIResponse(
      response,
      true,
      HTTP_STATUS.SUCCESS,
      "Sample CSV Downloaded!",
      csvContent
    );
  } catch (error: unknown) {
    if (error) {
      APIResponse(response, false, HTTP_STATUS.BAD_REQUEST, error as string);
    } else {
      return next(error);
    }
  }
};

const importCsv: RequestHandler = async (
  request: any,
  response: Response,
  next: NextFunction
) => {
  try {
    if (!request.file) {
      return APIResponse(
        response,
        false,
        HTTP_STATUS.BAD_REQUEST,
        "No CSV file uploaded"
      );
    }

    const results: any[] = [];

    fs.createReadStream(request.file.path)
      .pipe(csvParser())
      .on("data", (data: any) => results.push(data))
      .on("end", async () => {
        try {
          if (results.length === 0) {
            return APIResponse(
              response,
              false,
              HTTP_STATUS.BAD_REQUEST,
              "CSV file is empty"
            );
          }

          const values = results.map((row) => [
            row.image,
            row.name,
            row.description,
            row.type,
            row.isBest || 0,
            row.price,
          ]);

          await db.query(
            `INSERT INTO foods (image, name, description, type, isBest, price)
               VALUES ?`,
            [values]
          );

          APIResponse(
            response,
            true,
            HTTP_STATUS.SUCCESS,
            "CSV imported successfully",
            { totalRecords: results.length }
          );

          fs.unlink(request.file.path, () => {});
        } catch (err: any) {
          console.error("DB Error:", err);
          APIResponse(
            response,
            false,
            HTTP_STATUS.BAD_REQUEST,
            err.code === "ER_DUP_ENTRY"
              ? "Food with the same details is already available."
              : "Failed to import CSV"
          );
          fs.unlink(request.file.path, () => {});
        }
      })
      .on("error", (_err: any) => {
        APIResponse(
          response,
          false,
          HTTP_STATUS.BAD_REQUEST,
          "Error reading CSV file"
        );
        fs.unlink(request.file.path, () => {});
      });
  } catch (error: unknown) {
    if (error) {
      APIResponse(response, false, HTTP_STATUS.BAD_REQUEST, error as string);
    } else {
      return next(error);
    }
  }
};

const exportCsv: RequestHandler = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
  } catch (error: unknown) {
    if (error) {
      APIResponse(response, false, HTTP_STATUS.BAD_REQUEST, error as string);
    } else {
      return next(error);
    }
  }
};

export default {
  downloadSampleCsv,
  importCsv,
  exportCsv,
};
