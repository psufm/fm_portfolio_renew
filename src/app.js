import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import path from "path";
import passport from "passport";
import { connectSession } from "./session";
import { authChecker, addStatic } from "./middleware";
import globalRouter from "./routes/globalRouter";
import authRouter from "./routes/authRouter";

const app = express();

app.use(helmet());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(morgan("dev"));

app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(() => {
  console.log("test");
});

app.set("views", path.join(__dirname, "public"));
app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");
app.use("/", globalRouter);
app.use("/auth", authRouter);

export default app;
