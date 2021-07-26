import { Router } from "express";
import { authenticationGuard } from "./_utils";
import authenticateRouter from "./authenticate";
import personalPageRouter from "./personal";
import bioRouter from "./bio";

const mainRouter = Router();

mainRouter.get("/", function renderHome(req, res) {
  res.renderTemplate("template/index");
});

mainRouter.use(authenticateRouter);

mainRouter.use(bioRouter);

mainRouter.use(authenticationGuard);

mainRouter.use(personalPageRouter);

export default mainRouter;
