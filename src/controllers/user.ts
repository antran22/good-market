import { Router } from "express";
import UserModel, { IUser } from "@/models/User";
import CommentModel, {
  validateCommentContent,
  validateCommentRating,
  validateCommentTitle,
} from "@/models/Comment";
import { notNil } from "@/utils";
import { NotFoundError } from "@/exceptions";
import { authenticationGuard } from "@/controllers/_utils";

const userPageRouter = Router();

userPageRouter.get(
  "/user/:id",
  async function showPersonalPage(req, res, next) {
    const user = await UserModel.findByIdWithComments(req.params.id);
    if (notNil(user)) {
      return res.renderTemplate("templates/user", { user });
    }
    next(new NotFoundError(`Cannot find user with id ${req.params.id}`));
  }
);

userPageRouter.post(
  "/user/:id/comment",
  authenticationGuard,
  validateCommentTitle,
  validateCommentRating,
  validateCommentContent,

  async function addComment(req, res) {
    const errors = req.validate();
    if (!errors.isEmpty()) {
      req.flashValidationErrors(errors);
      return res.redirect("back");
    }

    const user: IUser = await UserModel.findById(req.params.id);
    const newComment = new CommentModel({
      rating: req.body.rating,
      title: req.body.title,
      content: req.body.content,
      author: req.user,
    });

    await newComment.save();
    user.comments.push(newComment);
    await user.save();
    res.redirect("back");
  }
);

export default userPageRouter;
