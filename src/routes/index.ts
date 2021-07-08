import { Router } from "express";
import passport from "@/config/passport";

const mainRouter = Router();

mainRouter.post("/login", passport.authenticate("local"), (req, res) => {
  res.json(req.user);
});

export default mainRouter;
