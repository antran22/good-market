import { Router } from "express";
import { authenticationGuard } from "./_utils";
import authenticateRouter from "./authenticate";
import personalDataRouter from "./personal";
import userPageRouter from "@/controllers/user";
import commentRouter from "@/controllers/comment";
import postRouter from "@/controllers/post";

const mainRouter = Router();

mainRouter.get("/", function renderHome(req, res) {
  return res.renderTemplate("templates/index");
});

mainRouter.use(authenticateRouter);

mainRouter.use(userPageRouter);

mainRouter.use(postRouter);

mainRouter.use(authenticationGuard);

mainRouter.use(personalDataRouter);

mainRouter.use(commentRouter);

export default mainRouter;
