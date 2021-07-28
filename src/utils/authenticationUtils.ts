import { Handler } from "express";
import { IUser } from "@/models/User";
import { ObjectId } from "mongoose";
import _ from "lodash";

declare global {
  namespace Express {
    interface Request {
      isMe(user: IUser | ObjectId): boolean;
    }
  }
}

const authenticationUtils: Handler = (req, res, next) => {
  req.isMe = function (user: IUser | ObjectId): boolean {
    if (_.has(user, "_id")) {
      return req.user._id.equals(user["_id"]);
    } else {
      return req.user._id.equals(user);
    }
  };
  next();
};

export default authenticationUtils;
