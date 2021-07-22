import { Router } from "express";
import UserModel from "@/models/User";





const personalPageRouter = Router();

personalPageRouter.get("/user/:userID", function(req, res) {
    res.renderTemplate("template/personal");
});

export default personalPageRouter;