import { Router } from "express";
import {
  displayNameInFormValidator,
  phoneNumberInFormValidator,
  reloadIfValidationFailed,
} from "@/utils/validator";

const bioRouter = Router();

bioRouter.get("/bio", function renderUserBioView(req, res) {
  res.renderTemplate("template/bio.ejs");
});

bioRouter.post(
  "/bio",
  displayNameInFormValidator,
  phoneNumberInFormValidator,
  reloadIfValidationFailed,
  async function updateUserBio(req, res) {
    req.user.displayName = req.body.displayName;
    req.user.phoneNumber = req.body.phoneNumber;
    await req.user.save();
    res.redirect("back");
  }
);

export default bioRouter;
