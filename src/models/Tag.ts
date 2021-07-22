import { Document, model, Schema } from "mongoose";
import { TagModelName } from "@/models/_const";

export interface ITag extends Document {
  text: string;
  description: string;
}

export const TagSchema = new Schema<ITag>({
  text: { type: String, require: true, unique: true },
  description: { type: String, require: true },
});

const TagModel = model<ITag>(TagModelName, TagSchema);
export default TagModel;
