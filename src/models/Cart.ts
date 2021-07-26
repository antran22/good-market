import {Schema, model, Document, PopulatedDoc} from "mongoose";
import {IUser} from "@/models/User";
import {IPost} from "@/models/Post";
import {CartModelName, PostModelName, UserModelName} from "@/models/_const";

interface ICart extends Document {
    products: PopulatedDoc<IPost>[];
    passenger: PopulatedDoc<IUser>;
}

const CartSchema = new Schema<Comment>(
    {
        products: [{
            type: Schema.Types.ObjectId,
            ref: PostModelName,
            require: true
        }],
        passenger: {
            type: Schema.Types.ObjectId,
            ref: UserModelName,
            required: true,
            unique: true
        },
    },
    {timestamps: true}
);

const CartModel = model<ICart>(CartModelName, CartSchema);
export default CartModel;
