import { Document, model, PopulatedDoc, Schema } from "mongoose";
import { IUser } from "@/models/User";
import { ITag } from "@/models/Tag";
import {
  CommentModelName,
  PostModelName,
  TagModelName,
  UserModelName,
} from "@/models/_const";

export interface IPost extends Document {
  images: string[];
  title: string;
  description: string;
  price: number;
  seller: PopulatedDoc<IUser>;
  tags: PopulatedDoc<ITag>[];
}

const PostSchema = new Schema<IPost>(
  {
    images: [{ type: String, require: true }],
    title: { type: String, require: true },
    description: { type: String, require: true },
    price: { type: Number, require: true, default: 0.0 },
    seller: {
      type: Schema.Types.ObjectId,
      ref: UserModelName,
      required: true,
    },
    tags: [
      {
        type: Schema.Types.ObjectId,
        ref: TagModelName,
        required: true,
      },
    ],
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

const PostModel = model<IPost>(PostModelName, PostSchema);
export default PostModel;
