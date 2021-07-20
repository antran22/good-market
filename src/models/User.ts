import { Schema, model, Document, PassportLocalModel } from "mongoose";
import passportLocalMongoose from "passport-local-mongoose";

export interface IUser extends Document {
  username: string;
  displayName: string;
  password: string;
  phoneNumber: string;
  score: number;
}

export const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true },
    displayName: { type: String, required: true },
    password: String,
    phoneNumber: String,
    score: { type: Number, default: 0, required: true },
  },
  { timestamps: true }
);

UserSchema.plugin(passportLocalMongoose);

const UserModel = model<IUser>("User", UserSchema);
export default UserModel as PassportLocalModel<IUser>;
