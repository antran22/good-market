import { Handler } from "express";

export const authenticationGuard: Handler = (req, res, next) => {
  if (req.isUnauthenticated()) {
    req.flash("error", "Please login first");
    return res.redirect("/login");
  }
  return next();
};

