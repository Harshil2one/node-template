import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import { Express, json, urlencoded, static as expressStatic } from "express";
import rateLimit from "express-rate-limit";
// import sanitize from "express-mongo-sanitize";
// import xss from "xss-clean";

const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000, // per hour
  message:
    "You've reached to maximum requests from this IP address. Please try after one hour.",
  standardHeaders: true,
  legacyHeaders: false,
});

const runStandardMiddleware = (app: Express) => {
  app.use(morgan("dev"));
  app.use(helmet()); // add security headers to the response headers
  app.use(limiter); // limit the requests from IP
  // app.use(sanitize()); // prevents queries to insert into request body
  // app.use(xss()); // prevents html to insert into request body
  app.use(cors({ origin: "*" })); // allow origin to prevent cross site scripting
  app.use(urlencoded({ extended: true, limit: "50mb" }));
  
  app.use(json({ limit: "50mb" })); // limit content
  app.use(expressStatic("./home"));
};

export default runStandardMiddleware;
