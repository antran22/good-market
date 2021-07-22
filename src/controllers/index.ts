import { Router } from "express";
import authenticateRouter from "@/controllers/authenticate";
import personalPageRouter from "./personal";
import { authenticationGuard } from "./_utils";

const mainRouter = Router();

mainRouter.get("/", function renderHome(req, res) {
  res.renderTemplate("template/index");
});

mainRouter.use(authenticateRouter);

mainRouter.use(authenticationGuard);

mainRouter.use(personalPageRouter);

export default mainRouter;
