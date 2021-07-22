import { Router } from "express";
import {
  displayNameInFormValidator,
  phoneNumberInFormValidator,
  reloadIfValidationFailed,
} from "@/utils/validator";
import multerUpload from "@/utils/multer";
import { notNil } from "@/utils";

const bioRouter = Router();

bioRouter.get("/bio", function renderUserBioView(req, res) {
  res.renderTemplate("template/bio.ejs");
});

bioRouter.post(
  "/bio",
  multerUpload.single("avatar"),
  displayNameInFormValidator,
  phoneNumberInFormValidator,
  reloadIfValidationFailed,
  async function updateUserBio(req, res) {
    req.user.displayName = req.body.displayName;
    req.user.phoneNumber = req.body.phoneNumber;
    if (notNil(req.file)) {
      req.user.avatar = req.file.path;
    }
    await req.user.save();
    res.redirect("back");
  }
);

export default bioRouter;
