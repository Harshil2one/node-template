import routes from "./routes";
import express, { Express } from "express";
import dotenv from "dotenv";
dotenv.config();

const http = require("http");
const app: Express = express();
const port = process.env.PORT;

app.use(express.json());
routes(app);

const server = http.createServer(app);

server.listen(port, () => {
  console.log(`Server is running on port: http://localhost:${port}`);
});

export default server;
