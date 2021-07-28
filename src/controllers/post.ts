import { Router } from "express";
import PostModel, { IPost } from "@/models/Post";
import multerUpload from "@/config/multer";
import * as fs from "fs";
import { authenticationGuard } from "@/controllers/_utils";
import { BadRequestError, ForbiddenError, NotFoundError } from "@/exceptions";
import {padWithSlash} from "@/utils";

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
  multerUpload.array("images[]"),
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
      tag: req.body.tag ?? [],
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
  multerUpload.array("images[]"),
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
    post.tags = req.body.tags;

    if (req.files && req.files instanceof Array && req.files.length>0) {
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

    post.images.forEach((image) => {
      fs.unlink(image, () => {});
    });
    post.delete();

    res.redirect("/post");
  }
);

postRouter.get("/post", async function renderPostList(req, res) {
  const limit = req.getLimitQuery();
  const offset = req.getOffsetQuery();
  let user = req.getQuery("user");

  let query = PostModel.find().limit(limit).skip(offset);

  if (user === "me" && req.isAuthenticated()) {
    user = req.user._id;
  }
  if (user) {
    query = query.where("seller", user);
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


export default postRouter;
