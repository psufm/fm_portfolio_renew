import express from "express";
import multer from "multer";
import Data from "../models/portfolio";
import User from "../models/user";

import {
  login,
  logout,
  home,
  loadData,
  modifyData
} from "../controller/userController";
import {
  regist,
  modify,
  imageAdd,
  imageRemove,
  saveCurrentPage
} from "../controller/dataController";

const globalRouter = express.Router();

globalRouter.post("/regist", regist);
globalRouter.post("/modify", modify);
globalRouter.post("/image_add", imageAdd);
globalRouter.post("/image_remove", imageRemove);
globalRouter.post("/save_current_page", saveCurrentPage);

globalRouter.get("/load_data", loadData);
globalRouter.get("/get_modify_data", modifyData);
globalRouter.get("/login", login);
globalRouter.get("/logout", logout);
globalRouter.get("/", home);

export default globalRouter;
