import { Schema, model, Document, PopulatedDoc } from "mongoose";
import { IUser } from "@/models/User";
import { CommentModelName, UserModelName } from "@/models/_const";

interface IComment extends Document {
  images: string;
  title: string;
  description: string;
  author: PopulatedDoc<IUser>;
}

const CommentSchema = new Schema<Comment>(
  {
    images: [{ type: String, require: true }],
    title: { type: String, require: true },
    description: { type: String, require: true },
    author: {
      type: Schema.Types.ObjectId,
      ref: UserModelName,
      required: true,
    },
  },
  { timestamps: true }
);

const CommentModel = model<IComment>(CommentModelName, CommentSchema);
export default CommentModel;
