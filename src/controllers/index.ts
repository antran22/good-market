import { Router } from "express";
import { authenticationGuard } from "./_utils";
import authenticateRouter from "./authenticate";
import bioRouter from "./bio";

const mainRouter = Router();

mainRouter.get("/", function renderHome(req, res) {
  res.renderTemplate("template/index");
});

mainRouter.use(authenticateRouter);

mainRouter.use(bioRouter);

mainRouter.use(authenticationGuard);

export default mainRouter;
