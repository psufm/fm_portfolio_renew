import express from "express";
import { callback, google } from "../../controller/googleController";
const googleRouter = express.Router();

googleRouter.get("/callback", callback); //controller
googleRouter.get("/", google); //controller

export default googleRouter;
