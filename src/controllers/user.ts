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
import {reloadIfValidationFailed} from "@/utils/validator";

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
  reloadIfValidationFailed,

  async function addComment(req, res) {
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
