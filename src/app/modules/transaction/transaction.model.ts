import { Schema, model } from "mongoose";
import {
  ITransaction,
  TransactionSourceEnum,
  TransactionStatusEnum,
  TransactionTypeEnum,
} from "./transaction.interface";

const transactionSchema = new Schema<ITransaction>(
  {
    type: {
      type: String,
      enum: Object.values(TransactionTypeEnum),
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: Object.values(TransactionStatusEnum),
      default: TransactionStatusEnum.Completed,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    source: {
      type: String,
      enum: Object.values(TransactionSourceEnum),
      required: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fee: {
      type: Number,
      default: 0,
    },
    commission: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Transaction = model<ITransaction>("Transaction", transactionSchema);
export default Transaction;
