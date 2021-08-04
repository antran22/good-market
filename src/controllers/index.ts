import { Router } from "express";
import { authenticationGuard } from "./_utils";
import authenticateRouter from "./authenticate";
import personalDataRouter from "./personal";
import userPageRouter from "@/controllers/user";
import commentRouter from "@/controllers/comment";
import postRouter from "@/controllers/post";
import messageRouter from "@/controllers/message";
import searchRouter from "@/controllers/search";
import PostModel from "@/models/Post";

const mainRouter = Router();

mainRouter.get("/", async function renderHome(req, res) {
  const newestPosts = await PostModel.find()
    .sort({ createdAt: "descending" })
    .limit(10);

  return res.renderTemplate("templates/index", { posts: newestPosts });
});

mainRouter.use(searchRouter);

mainRouter.use(authenticateRouter);

mainRouter.use(userPageRouter);

mainRouter.use(postRouter);

mainRouter.use(authenticationGuard);

mainRouter.use(personalDataRouter);

mainRouter.use(commentRouter);

mainRouter.use(messageRouter);

export default mainRouter;
