import express from "express";
import path from "path";

export const authChecker = (req, res, next) => {
  if (
    req.isAuthenticated() ||
    req.path == "/login" ||
    req.path.includes("/auth/google")
  ) {
    next();
  } else {
    res.redirect("/login");
  }
};

export const addStatic = dirpath => {
  return express.static(path.join(__dirname, dirpath));
};
