import { Router } from "express";
import passport from "passport";
import UserModel from "@/models/User";

const authenticateRouter = Router();

authenticateRouter.get("/login", function renderLoginView(req, res) {
  if (req.isAuthenticated()) {
    res.redirect("/");
  }
  res.renderTemplate("template/login");
});

authenticateRouter.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    successFlash: "Logged in successfully",
    failureRedirect: "/login",
    failureFlash: "Login failed",
  })
);

authenticateRouter.get("/register", function renderRegisterView(req, res) {
  if (req.isAuthenticated()) {
    res.redirect("/");
  }
  res.renderTemplate("template/register");
});

authenticateRouter.post("/register", function registerUser(req, res) {
  UserModel.register(
    new UserModel({
      username: req.body.username,
      displayName: req.body.displayName,
    }),
    req.body.password,
    function (err: Error, user) {
      if (err) {
        req.flash("error", `Register failed: ${err.message}`);
        return res.renderTemplate("template/register");
      }
      req.flash("success", "Registered successfully. Please login");
      return res.redirect("/login");
    }
  );
});

authenticateRouter.get("/logout", function logout(req, res) {
  if (req.isUnauthenticated()) {
    return res.redirect("/login");
  }
  req.logout();
  req.flash("success", "Logged out");
  res.redirect("/login");
});

export default authenticateRouter;
