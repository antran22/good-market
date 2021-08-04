import { Document, model, Model, PopulatedDoc, Schema } from "mongoose";
import { IUser } from "@/models/User";
import { CommentModelName, UserModelName } from "@/models/_const";
import { body } from "express-validator";
import fs from "fs";
import env from "@/config/env";

export interface IComment extends Document {
  images: string[];
  title: string;
  content: string;
  author: PopulatedDoc<IUser>;
}

export interface ICommentModel extends Model<IComment> {
  findByIdWithAuthor(_id: string): Promise<IComment>;
}

const CommentSchema = new Schema<IComment>(
  {
    images: [{ type: String, require: true }],
    rating: { type: Number, require: true, default: 3, max: 5, min: 1 },
    title: { type: String, require: true },
    content: { type: String, require: true },
    author: {
      type: Schema.Types.ObjectId,
      ref: UserModelName,
      required: true,
    },
  },
  { timestamps: true}
);
CommentSchema.index({"content": "text", "title": "text"});

CommentSchema.statics.findByIdWithAuthor = async function (
  _id: string
): Promise<IComment> {
  return this.findById(_id).populate("author");
};

CommentSchema.pre("remove", function (next) {
  this.images.forEach((image) => {
    fs.unlink(env.projectPath(image), console.error);
  });
  next();
});

const CommentModel = model<IComment, ICommentModel>(
  CommentModelName,
  CommentSchema
);

export default CommentModel;

export const validateCommentContent = body("content")
  .isLength({ min: 1, max: 300 })
  .withMessage(
    "Comment content must not be empty and at most 300-character long"
  );

export const validateCommentTitle = body("title")
  .isLength({ min: 1, max: 40 })
  .withMessage("Comment title must not be empty and at most 40-character long");

export const validateCommentRating = body("rating")
  .isInt({ min: 1, max: 5 })
  .withMessage("Rating must be between 1 and 5");
