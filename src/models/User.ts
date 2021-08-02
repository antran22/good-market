import {
  Document,
  model,
  PassportLocalModel,
  PopulatedDoc,
  Schema,
} from "mongoose";
import passportLocalMongoose from "passport-local-mongoose";
import PostModel, { IPost } from "@/models/Post";
import { CommentModelName, UserModelName } from "@/models/_const";
import CommentModel, { IComment } from "@/models/Comment";
import { body } from "express-validator";
import { equalToFieldInBody } from "@/utils/validator";

export interface IUser extends Document {
  username: string;
  displayName: string;
  password?: string;
  avatar?: string;
  phoneNumber: string;
  score: number;
  comments: PopulatedDoc<IComment>[];

  createPost(post: Partial<IPost>): IPost;

  calculateScore(): Promise<number>;
}

export interface IUserModel extends PassportLocalModel<IUser> {
  findByIdWithComments(_id: string): Promise<IUser>;
}

export const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true },
    displayName: { type: String, required: true },
    password: String,
    avatar: String,
    phoneNumber: { type: String, required: true },
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: CommentModelName,
      },
    ],
  },
  { timestamps: true }
);
UserSchema.index({"username": "text", "displayName": "text", "phoneNumber": "text"});
UserSchema.plugin(passportLocalMongoose);

UserSchema.methods.createPost = function (post: Partial<IPost>): IPost {
  return new PostModel({ ...post, seller: this._id });
};

UserSchema.methods.calculateScore = async function (): Promise<number> {
  const res = await CommentModel.aggregate([
    { $match: { _id: { $in: this.comments } } },
    { $group: { _id: null, average: { $avg: "$rating" } } },
  ]);
  return res[0]?.average ?? 0;
};

UserSchema.statics.findByIdWithComments = function (_id: string) {
  return UserModel.findById(_id).populate({
    path: "comments",
    populate: { path: "author" },
  });
};

// UserSchema.index("username");

const UserModel = model<IUser, IUserModel>(UserModelName, UserSchema);
export default UserModel;

export const validatePassword = body("password")
  .isString()
  .withMessage("Password must be a valid string")
  .isLength({ min: 8 })
  .withMessage("Password length must be at least 8")
  .custom(equalToFieldInBody("passwordConfirm"))
  .withMessage("Password must match passwordConfirm");

export const validateUserName = body("username")
  .isAlphanumeric("en-US", {
    ignore: "_",
  })
  .withMessage("Username must contain only alphabetic, numeric character and _")
  .isLength({ min: 8, max: 32 })
  .withMessage("Username length must be from 8 to 32 characters long");

export const validateDisplayName = body("displayName")
  .exists()
  .withMessage("Invalid value for Display Name");

export const validatePhoneNumber = body("phoneNumber")
  .isMobilePhone("vi-VN")
  .withMessage("Invalid value for Phone Number");
