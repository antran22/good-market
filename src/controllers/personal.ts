import { Router } from "express";
import { reloadIfValidationFailed } from "@/utils/validator";
import multerUpload from "@/config/multer";
import { notNil } from "@/utils";
import { validateDisplayName, validatePhoneNumber } from "@/models/User";

const personalDataRouter = Router();

personalDataRouter.get("/me", function renderPersonalDataView(req, res) {
  return res.renderTemplate("templates/personalData.ejs");
});

personalDataRouter.post(
  "/me",
  multerUpload.single("avatar"),
  validateDisplayName,
  validatePhoneNumber,
  reloadIfValidationFailed,
  async function updatePersonalData(req, res) {
    req.user.displayName = req.body.displayName;
    req.user.phoneNumber = req.body.phoneNumber;
    if (notNil(req.file)) {
      req.user.avatar = "/" + req.file.path;
    }
    await req.user.save();
    res.redirect("back");
  }
);

export default personalDataRouter;
