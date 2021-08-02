import { Document, Model, model, PopulatedDoc, Schema } from "mongoose";
import { IUser } from "@/models/User";
import  { IPost } from "@/models/Post";
import {
    PostModelName, TransactionModelName,
    UserModelName,
} from "@/models/_const";

export interface ITransaction extends Document {
    products: PopulatedDoc<IPost>[];
    users: PopulatedDoc<IUser>[];
    confirms: boolean[];
}

export interface ITransactionModel extends Model<ITransaction> {
    findByIdFullyPopulated(id: string): Promise<ITransaction>;
}

const TransactionSchema = new Schema<ITransaction>(
    {
        products: [{
            type: Schema.Types.ObjectId,
            ref: PostModelName,
            required: true,
        }],
        users: [{
            type: Schema.Types.ObjectId,
            ref: UserModelName,
            required: true,
        }],
        confirms: [Boolean],
    },
    { timestamps: true }
);


const TransactionModel = model<ITransaction, ITransactionModel>(TransactionModelName, TransactionSchema);
export default TransactionModel;
