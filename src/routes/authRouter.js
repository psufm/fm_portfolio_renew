import express from "express";
import googleRouter from "./google/googleRouter";
const authRouter = express.Router();

authRouter.get("/google", googleRouter);

export default authRouter;
