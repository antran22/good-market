import { Router } from "express";
import authenticateRouter from "@/controllers/authenticate";

const mainRouter = Router();

mainRouter.use(authenticateRouter);

mainRouter.use((req, res, next) => {
  if (req.isUnauthenticated()) {
    req.flash("error", "Please login first");
    return res.redirect("/login");
  }
  return next();
});

mainRouter.get("/", function renderHome(req, res) {
  res.renderTemplate("template/index");
});

export default mainRouter;
