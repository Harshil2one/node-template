import routes from "./routes";
import express, { Express } from "express";
import dotenv from "dotenv";
import { errorHandler, notFound } from "./middlewares/logger";
import runStandardMiddleware from "./middlewares/standard.middleware";

dotenv.config();

const http = require("http");
const app: Express = express();
const port = process.env.PORT;

runStandardMiddleware(app);

app.use(express.json());
routes(app);

app.use(notFound);
app.use(errorHandler);

const server = http.createServer(app);

server.listen(port, () => {
  console.log(`Server is running on port: http://localhost:${port}/${process.env.BASE_URL}`);
});

export default server;
