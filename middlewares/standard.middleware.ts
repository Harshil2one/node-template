import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import { Express, json, urlencoded } from "express";

const runStandardMiddleware = (app: Express) => {
  app.use(
    morgan("Request: :method :url :status :response-time ms", {
      stream: {
        write: (message: string) => {
          console.info(message.trim());
        },
      },
    })
  );
  app.use(helmet());
  app.use(cors({ origin: "*" }));
  app.use(urlencoded({ extended: true, limit: "50mb" }));
  app.use(json({ limit: "50mb" }));
};

export default runStandardMiddleware;
