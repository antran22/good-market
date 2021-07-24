import { Router } from "express";
import UserModel from "@/models/User";
import CommentModel from "@/models/Comment";

const personalPageRouter = Router();

async function check_valid_user(req, res, next) {
  try {
    req.other = await UserModel.findById(req.params.userID).exec();
    next();
  } catch (error) {
    req.flash("error", "User not found.");
    res.redirect("/");
  }
}

async function extract_comments(req, res, next) {
  for(let i = 0; i < req.other.comments.length; i++) {
    try {
      req.other.comments[i] = await CommentModel.findById(req.other.comments[i]).exec();
    } catch (error) {
      continue;
    }
  }
  next();
}

async function show_personal_page(req, res, next) {
  console.log(await CommentModel.count({}));
  console.log(await UserModel.count({}));
  res.renderTemplate("template/personal", { other_user: req.other });
}

async function check_valid_comment(req, res, next) {
  if (req.body.comment === "") {
    req.flash("error", "Invalid comment.");
    res.redirect("/user/" + req.params.userID);
  }
  else 
    next();
}

async function add_comment(req, res, next) {
  UserModel.findById(req.user._id, async function (err, result) {
    let newComment = new CommentModel({
      images: "",
      title: "",
      description: req.body.comment,
      author: req.user,
    });
    newComment = await newComment.save();
    result.comments.push(newComment);
    await result.save();
    res.redirect("/user/" + req.params.userID);
  });
}

async function check_valid_delete(req, res, next) {
  await CommentModel.findById(req.params.commentID, async function(err, result) {
    if (req.params.userID.toString() == req.user._id.toString() 
    || result.author.toString() == req.user._id.toString())
      next();
  });
  req.flash("error", "Invalid delete.");
  res.redirect("/user/" + req.params.userID);
};

async function delete_comment(req, res, next) {

  try {
    await CommentModel.deleteOne({_id: req.params.commentID});
    let result = await UserModel.findById(req.params.userID).exec()
    await result.comments.splice(result.comments.indexOf(req.params.commentID), 1); 
    await result.save();

    req.flash("success", "Deleted comment.")
  } catch (err) {
  }
  // res.redirect("/user/" + req.params.userID);
}

personalPageRouter.get(
  "/user/:userID", 
  check_valid_user, 
  extract_comments,
  show_personal_page
  );

personalPageRouter.post(
  "/user/:userID/add", 
  check_valid_comment, 
  add_comment
  );

personalPageRouter.post(
  "/user/:userID/delete/:commentID",
  check_valid_delete,
  delete_comment
)

export default personalPageRouter;
