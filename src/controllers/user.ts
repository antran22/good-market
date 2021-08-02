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
import Post from "@/models/Post";
import {Schema} from "mongoose";
import PostModel from "@/models/Post";

const userPageRouter = Router();
async function  statistical_calculation(id){
    let date = new Date();
    let first_month = new Date(date.getFullYear(), date.getMonth(), 1);
    let first_year = new Date(date.getFullYear(), 1, 1);
    let in_month = {"createdAt":{ $gt:first_month, $lt:date}};
    let in_year = {"createdAt":{ $gt:first_year, $lt:date}};
    let is_seller = {"seller":id};
    let in_stock = {"tag": "In stock"};
    let sold = {"tag": "Sold out"}
    let rs = {
        link: '/?seller='+id,
        in_stock: (await Post.find(Object.assign({}, is_seller, in_stock))).length,
        sold: (await Post.find(Object.assign({}, is_seller, sold))).length,
        this_month:{
            link: '/?seller='+id+'&fromdate='+ first_month.toISOString()+'&todate='+date.toISOString(),
            in_stock:(await Post.find(Object.assign({}, is_seller, in_month, in_stock))).length,
            sold:(await Post.find(Object.assign({}, is_seller, in_month, sold))).length,
        },
        this_year:{
            link: '/?seller='+id+'&fromdate='+ first_year.toISOString()+'&todate='+date.toISOString(),
            in_stock:(await Post.find(Object.assign({}, is_seller, in_year, in_stock))).length,
            sold:(await Post.find(Object.assign({}, is_seller, in_year, sold))).length,
        }
    }
    return rs



}
userPageRouter.get(
  "/user/:id",
  async function showPersonalPage(req, res, next) {
    const user = await UserModel.findByIdWithComments(req.params.id);
    if (notNil(user)) {
        const statistic = await statistical_calculation(req.params.id);
        console.log(statistic)
      return res.renderTemplate("templates/user", { user:user, statistic:statistic });
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
