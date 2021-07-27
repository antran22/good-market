import { Router } from "express";
import CommentModel, { IComment } from "@/models/Comment";
import { ForbiddenError, NotFoundError } from "@/exceptions";

const commentPageRouter = Router();

commentPageRouter.get(
  "/comment/:id/delete",

  async function deleteComment(req, res) {
    const comment = await CommentModel.findById(req.params.id);
    if (!comment) {
      throw new NotFoundError(`Cannot find comment with id ${req.params.id}`);
    }
    if (!comment.author.equals(req.user._id)) {
      throw new ForbiddenError("You cannot delete other people's comments");
    }
    await comment.delete();
    res.redirect("back");
  }
);

commentPageRouter.post(
  "/comment/:id/update",

  async function updateComment(req, res) {
    const errors = req.validate();
    if (!errors.isEmpty()) {
      req.flashValidationErrors(errors);
      return res.redirect("back");
    }

    const comment: IComment = await CommentModel.findById(req.params.id);
    if (!comment) {
      throw new NotFoundError(`Cannot find comment with id ${req.params.id}`);
    }
    if (!comment.author.equals(req.user._id)) {
      throw new ForbiddenError("You cannot delete other people's comments");
    }

    comment.content = req.body.content;
    await comment.save();
    res.redirect("back");
  }
);

export default commentPageRouter;
