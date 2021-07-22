import { Schema, model, Document, PassportLocalModel } from "mongoose";
import passportLocalMongoose from "passport-local-mongoose";
import PostModel, { IPost } from "@/models/Post";
import { UserModelName } from "@/models/_const";

export interface IUser extends Document {
  username: string;
  displayName: string;
  password?: string;
  avatar?: string;
  phoneNumber: string;
  score: number;

  createPost(post: Partial<IPost>): IPost;
}

export const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true },
    displayName: { type: String, required: true },
    password: String,
    avatar: String,
    phoneNumber: { type: String, required: true },
    score: { type: Number, default: 0, required: true },
  },
  { timestamps: true }
);

UserSchema.plugin(passportLocalMongoose);

UserSchema.methods.createPost = function (post: Partial<IPost>): IPost {
  return new PostModel({ ...post, seller: this._id });
};

UserSchema.index("username");

const UserModel = model<IUser>(
  UserModelName,
  UserSchema
) as PassportLocalModel<IUser>;
export default UserModel;
