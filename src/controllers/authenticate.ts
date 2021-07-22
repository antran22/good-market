import { Router } from "express";
import passport from "passport";
import UserModel from "@/models/User";
import {
  displayNameInFormValidator,
  passwordInFormValidator,
  phoneNumberInFormValidator,
  usernameInFormValidator,
} from "@/utils/validator";
import multerUpload from "@/utils/multer";

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
  res.renderTemplate("template/register", { defaultBody: null });
});

authenticateRouter.post(
  "/register",
  multerUpload.single("avatar"),
  passwordInFormValidator,
  usernameInFormValidator,
  displayNameInFormValidator,
  phoneNumberInFormValidator,
  function registerUser(req, res) {
    const validationErrors = req.validate();
    if (!validationErrors.isEmpty()) {
      req.flashValidationErrors(validationErrors);
      return res.renderTemplate("template/register", {
        defaultBody: req.body,
      });
    }
    UserModel.register(
      new UserModel({
        username: req.body.username,
        displayName: req.body.displayName,
        phoneNumber: req.body.phoneNumber,
        avatar: req.file?.path ?? null,
      }),
      req.body.password,
      function (err: Error, user) {
        if (err) {
          req.flash("error", `Register failed: ${err.message}`);
          return res.renderTemplate("template/register", {
            defaultBody: req.body,
          });
        }
        req.flash("success", "Registered successfully. Please login");
        return res.redirect("/login");
      }
    );
  }
);

authenticateRouter.get("/logout", function logout(req, res) {
  if (req.isUnauthenticated()) {
    return res.redirect("/login");
  }
  req.logout();
  req.flash("success", "Logged out");
  res.redirect("/login");
});

export default authenticateRouter;
