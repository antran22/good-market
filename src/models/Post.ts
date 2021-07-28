import { Document, Model, model, PopulatedDoc, Schema } from "mongoose";
import { IUser } from "@/models/User";
import {
  CommentModelName,
  PostModelName,
  UserModelName,
} from "@/models/_const";
import { IComment } from "@/models/Comment";

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

PostSchema.statics.findByIdFullyPopulated = function (id: string) {
  return PostModel.findById(id).populate("seller").populate({
    path: "comments",
    populate: "author",
  });
};

const PostModel = model<IPost, IPostModel>(PostModelName, PostSchema);
export default PostModel;
