import { Router } from "express";
import authenticateRouter from "@/controllers/authenticate";
import { authenticationGuard } from "./_utils";

const mainRouter = Router();

mainRouter.get("/", function renderHome(req, res) {
  res.renderTemplate("template/index");
});

mainRouter.use(authenticateRouter);

mainRouter.use(authenticationGuard);

export default mainRouter;
