import routes from "./routes";
import express, { Express } from "express";
import dotenv from "dotenv";
import { errorHandler, notFound } from "./middlewares/logger";
import runStandardMiddleware from "./middlewares/standard.middleware";
import { initializeSocket } from "./config/socket.config";
dotenv.config();

const app: Express = express();
const port = process.env.PORT;

runStandardMiddleware(app);

const startServer = async () => {
  routes(app);

  app.use(notFound);
  app.use(errorHandler);

  const { server } = initializeSocket(app);
  server.listen(port, () => {
    console.log(
      `Server is running on port: http://localhost:${port}/${process.env.BASE_URL}`
    );
  });
};

startServer();
