import { Document, Model, model, PopulatedDoc, Schema } from "mongoose";
import { IUser } from "@/models/User";
import {
  CommentModelName,
  PostModelName,
  UserModelName,
} from "@/models/_const";

export interface IPost extends Document {
  images: string[];
  title: string;
  description: string;
  price: number;
  seller: PopulatedDoc<IUser>;
  tags: string[];
}

export interface IPostModel extends Model<IPost> {}

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

const PostModel = model<IPost, IPostModel>(PostModelName, PostSchema);
export default PostModel;
