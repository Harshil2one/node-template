import express from "express";
import { validateToken } from "../middlewares/auth.middleware";
import csvController from "../controllers/csv.controller";
import multer from "multer";
const upload = multer({ dest: "uploads/" });

const csvRouter = express.Router();

const { downloadSampleCsv, importCsv, exportCsv } = csvController;

csvRouter.use(validateToken);

csvRouter.get("/sample-download", downloadSampleCsv);

csvRouter.post("/import", upload.single("file"), importCsv);

csvRouter.post("/export", exportCsv);

export default csvRouter;
