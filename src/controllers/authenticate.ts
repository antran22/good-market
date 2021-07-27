import { Router } from "express";
import passport from "passport";
import UserModel, {
  validateDisplayName,
  validatePassword,
  validatePhoneNumber,
  validateUserName,
} from "@/models/User";
import multerUpload from "@/config/multer";

const authenticateRouter = Router();

authenticateRouter.get("/login", function renderLoginView(req, res) {
  if (req.isAuthenticated()) {
    res.redirect("/");
  }
  return res.renderTemplate("templates/login");
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
  return res.renderTemplate("templates/register", { defaultBody: null });
});

authenticateRouter.post(
  "/register",
  multerUpload.single("avatar"),
  validatePassword,
  validateUserName,
  validateDisplayName,
  validatePhoneNumber,
  function registerUser(req, res) {
    const validationErrors = req.validate();
    if (!validationErrors.isEmpty()) {
      req.flashValidationErrors(validationErrors);
      return res.renderTemplate("templates/register", {
        defaultBody: req.body,
      });
    }
    const avatarPath = req.file?.path;
    UserModel.register(
      new UserModel({
        username: req.body.username,
        displayName: req.body.displayName,
        phoneNumber: req.body.phoneNumber,
        avatar: avatarPath ? "/" + avatarPath : null,
      }),
      req.body.password,
      function (err: Error, user) {
        if (err) {
          req.flash("error", `Register failed: ${err.message}`);
          return res.renderTemplate("templates/register", {
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
