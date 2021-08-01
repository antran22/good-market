import { Document, Model, model, PopulatedDoc, Schema } from "mongoose";
import { IUser } from "@/models/User";
import {
  CommentModelName,
  PostModelName,
  UserModelName,
} from "@/models/_const";
import CommentModel, { IComment } from "@/models/Comment";
import fs from "fs";
import env from "@/config/env";
import { body } from "express-validator";

export interface IPost extends Document {
  images: string[];
  title: string;
  description: string;
  price: number;
  seller: PopulatedDoc<IUser>;
  tags: string[];
  comments: PopulatedDoc<IComment>;
}

export interface IPostModel extends Model<IPost> {
  findByIdFullyPopulated(id: string): Promise<IPost>;
}

const PostSchema = new Schema<IPost>(
  {
    images: [String],
    title: { type: String, require: true },
    description: { type: String, require: true },
    price: { type: Number, require: true, default: 0.0 },
    seller: {
      type: Schema.Types.ObjectId,
      ref: UserModelName,
      required: true,
    },
    tags: [String],
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: CommentModelName,
        required: true,
      },
    ],
  },
  { timestamps: true }
);
PostSchema.index({"description": "text", "title": "text"});

PostSchema.statics.findByIdFullyPopulated = function (id: string) {
  return PostModel.findById(id).populate("seller").populate({
    path: "comments",
    populate: "author",
  });
};

PostSchema.pre("remove", function (next) {
  this.images.forEach((image) => {
    fs.unlink(env.projectPath(image), console.error);
  });
  CommentModel.deleteMany({ _id: { $in: this.comments } }, next);
});

const PostModel = model<IPost, IPostModel>(PostModelName, PostSchema);
export default PostModel;

export const validatePostTitle = body("title")
  .isLength({ min: 1, max: 40 })
  .withMessage("Post title must not be empty and under 40 characters");

export const validatePostDescription = body("description")
  .isLength({
    min: 1,
    max: 500,
  })
  .withMessage("Post content must not be empty and under 500 characters");

export const validatePostPrice = body("price")
  .isInt({ min: 0 })
  .withMessage("Price must be a positive number");

export const validatePostTags = body("tags")
  .isArray({ max: 5 })
  .withMessage("A post should have at most 5 tags")
  .custom((input: string[]) => {
    input.forEach((s) => {
      if (s.length > 10) {
        throw new Error();
      }
    });
  })
  .withMessage("Post tags should not be longer than 10 characters");
