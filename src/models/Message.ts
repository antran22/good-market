import {Document, model, Model, PopulatedDoc, Schema} from "mongoose";
import {IUser} from "@/models/User";
import {MessageModelName, UserModelName} from "@/models/_const";
import {body} from "express-validator";

export interface IMessage extends Document {
  title: string;
  content: string;
  author: PopulatedDoc<IUser>;
}

export interface IMessageModel extends Model<IMessage> {
  findByParticipants(
    userId1: string,
    userId2: string,
  ): Promise<IMessage[]>;
}

const MessageSchema = new Schema<IMessage>(
  {
    text: { type: String, require: true },
    sender: {
      type: Schema.Types.ObjectId,
      ref: UserModelName,
      required: true,
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: UserModelName,
      required: true,
    },
  },
  { timestamps: true }
);

MessageSchema.statics.findByParticipants = async function (
  userId1: string,
  userId2: string
): Promise<IMessage> {
  return this.find({
    $or: [
      { sender: userId1, recipient: userId2 },
      { sender: userId2, recipient: userId1 },
    ],
  }).sort({ createdAt: "descending" });
};

const MessageModel = model<IMessage, IMessageModel>(
  MessageModelName,
  MessageSchema
);

export default MessageModel;

export const validateMessageText = body("text")
  .isLength({ min: 1, max: 100 })
  .withMessage(
    "Message content must not be empty and at most 100-character long"
  );
