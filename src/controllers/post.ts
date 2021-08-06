import { Router } from "express";
import PostModel, {
  IPost,
  validatePostDescription,
  validatePostPrice,
  validatePostTitle,
} from "@/models/Post";
import multerUpload from "@/config/multer";
import * as fs from "fs";
import { authenticationGuard } from "@/controllers/_utils";
import { BadRequestError, ForbiddenError, NotFoundError } from "@/exceptions";
import { padWithSlash } from "@/utils";
import CommentModel, {
  validateCommentContent,
  validateCommentRating,
  validateCommentTitle,
} from "@/models/Comment";
import { reloadIfValidationFailed } from "@/utils/validator";

const postRouter = Router();

postRouter.get(
  "/post/create",
  authenticationGuard,
  async function renderCreatePostView(req, res) {
    return res.renderTemplate("templates/post/create", { post: null });
  }
);

postRouter.post(
  "/post/create",
  authenticationGuard,
  multerUpload.array("images[]", 5),
  validatePostTitle,
  validatePostDescription,
  validatePostPrice,

  async function createPost(req, res) {
    const errors = req.validate();
    if (!errors.isEmpty()) {
      req.flashValidationErrors(errors);
      return res.renderTemplate("templates/post/create", {
        post: {
          title: req.body.title,
          description: req.body.description,
          price: req.body.price,
        },
      });
    }

    if (!(req.files instanceof Array)) {
      req.files = [];
    }
    const newPost = new PostModel({
      title: req.body.title,
      images: req.files.map((file) => padWithSlash(file.path)),
      description: req.body.description,
      price: req.body.price,
      seller: req.user._id,
    });

    await newPost.save();
    res.status(201).redirect("/post");
  }
);

postRouter.get(
  "/post/:id/edit",
  authenticationGuard,
  async function renderEditPostView(req, res, next) {
    const post: IPost = await PostModel.findById(req.params.id);
    if (!post) {
      throw new NotFoundError(`No post with id ${req.params.id} existing`);
    }
    if (!req.isMe(post.seller)) {
      throw new ForbiddenError(`You cannot edit other people's post`);
    }
    return res.renderTemplate("templates/post/edit", { post });
  }
);

postRouter.post(
  "/post/:id/edit",
  authenticationGuard,
  multerUpload.array("images[]", 5),
  validatePostTitle,
  validatePostDescription,
  validatePostPrice,
  reloadIfValidationFailed,
  async function editPost(req, res, next) {
    const post: IPost = await PostModel.findById(req.params.id);

    if (!post) {
      throw new NotFoundError(`No post with id ${req.params.id} existing`);
    }
    if (!req.isMe(post.seller)) {
      throw new ForbiddenError(`You cannot edit other people's post`);
    }

    post.title = req.body.title;
    post.description = req.body.description;
    post.price = req.body.price;
    post.tag = req.body.tag;
    post.sold = !!req.body.sold;

    if (req.files && req.files instanceof Array && req.files.length > 0) {
      post.images = req.files.map((file) => padWithSlash(file.path));
    }

    await post.save();
    res.redirect("/post");
  }
);

postRouter.get(
  "/post/:id/delete",
  authenticationGuard,
  async function deletePost(req, res) {
    const postId = req.params.id;
    const post: IPost = await PostModel.findById(postId);

    if (!post) {
      throw new NotFoundError(`No post with id ${req.params.id} existing`);
    }
    if (post.seller.toString() != req.user._id.toString()) {
      throw new ForbiddenError("You cannot delete other people's post");
    }

    post.delete();

    res.redirect("/post");
  }
);

postRouter.get("/post", async function renderPostList(req, res) {
  let user = req.getQuery("user");

  const keyword = req.getQuery("keyword");

  const fromDate = req.getQueryDate("from-date");
  const toDate = req.getQueryDate("to-date");

  const fromPrice = req.getQueryInt("from-price");
  const toPrice = req.getQueryInt("to-price");

  let query = PostModel.find();
  if (user === "me" && req.isAuthenticated()) {
    user = req.user._id;
  }

  if (user) {
    query = query.where("seller", user);
  }

  if (fromDate) {
    query = query.where("createdAt").gte(fromDate.getTime());
  }

  if (toDate) {
    toDate.setHours(23, 59, 59);
    query = query.where("createdAt").lte(toDate.getTime());
  }

  if (fromPrice) {
    query = query.where("price").gte(fromPrice);
  }

  if (toPrice) {
    query = query.where("price").lte(toPrice);
  }

  if (keyword) {
    query = query.where("title").regex(`.*(?i)${keyword}(?-i).*`);
  }

  const posts = await query;
  return res.renderTemplate("templates/post/list", { posts });
});

postRouter.get("/post/:id", async function renderSinglePost(req, res) {
  const post = await PostModel.findByIdFullyPopulated(req.params.id);
  if (!post) {
    throw new NotFoundError(`No post with id ${req.params.id} existing`);
  }
  return res.renderTemplate("templates/post/view", { post });
});

postRouter.post(
  "/post/:id/comment",
  authenticationGuard,
  validateCommentTitle,
  validateCommentContent,
  reloadIfValidationFailed,

  async function addComment(req, res) {
    const post: IPost = await PostModel.findById(req.params.id);
    const newComment = new CommentModel({
      title: req.body.title,
      content: req.body.content,
      author: req.user,
    });

    await newComment.save();
    post.comments.push(newComment);
    await post.save();
    res.redirect("back");
  }
);

export default postRouter;
