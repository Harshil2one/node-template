const swaggerJSDoc = require("swagger-jsdoc");
const path = require("path");

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Nodejs Template",
    version: "1.0.0",
    description:
      "Provides API Integration template which includes Folder structure, routing, authentication floe, Sample CRUD and Database connection setup using typescript",
  },
};

const options = {
  swaggerDefinition,
  apis: [path.join(__dirname, "../routes/*.ts")],
};

const swaggerConfig = swaggerJSDoc(options);
module.exports = swaggerConfig;
