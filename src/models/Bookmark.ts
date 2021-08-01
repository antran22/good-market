import { Document, model, Model, PopulatedDoc, Schema } from "mongoose";
import { IUser } from "@/models/User";
import {BookmarkModelName, PostModelName, UserModelName} from "@/models/_const";
import { body } from "express-validator";
import {IPost} from "@/models/Post";

export interface IBookmark extends Document {
    post: PopulatedDoc<IPost>;
    status: string;
    user: PopulatedDoc<IUser>;
}

export interface IBookmarkModel extends Model<IBookmark> {
    findByIdWithUser(_id: string): Promise<IBookmark>;
}

const BookmarkSchema = new Schema<IBookmark>(
    {
        status: { type: String, require: true },
        user: {
            type: Schema.Types.ObjectId,
            ref: UserModelName,
            required: true,
        },
        post: {
            type: Schema.Types.ObjectId,
            ref: PostModelName,
            required: true,
        },

    },
    { timestamps: true }
);

BookmarkSchema.statics.findByIdWithAuthor = async function (
    _id: string
): Promise<IBookmark> {
    return this.findById(_id).populate("user");
};

const BookmarkModel = model<IBookmark, IBookmarkModel>(
    BookmarkModelName,
    BookmarkSchema
);

export default BookmarkModel;

