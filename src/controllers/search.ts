import { Router } from "express";

const searchRouter = Router();

searchRouter.get("/search", function renderFilteredPost(req, res, next) {
  return res.renderTemplate("templates/search");
});
export default searchRouter;
