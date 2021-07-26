import {Router} from "express";
import {authenticationGuard} from "./_utils";
import authenticateRouter from "./authenticate";
import personalPageRouter from "./personal";
import bioRouter from "./bio";
import myPostRouter from "@/controllers/myPost";
import showRouter from "@/controllers/showpost";

const mainRouter = Router();

mainRouter.get("/", function renderHome(req, res) {
    res.renderTemplate("template/index");
});

mainRouter.use(authenticateRouter);

mainRouter.use(bioRouter);

mainRouter.use(myPostRouter);

mainRouter.use(showRouter);

mainRouter.use(authenticationGuard);

mainRouter.use(personalPageRouter);

export default mainRouter;
