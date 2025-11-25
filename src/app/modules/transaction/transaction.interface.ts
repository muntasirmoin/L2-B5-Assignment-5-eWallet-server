import { Types } from "mongoose";

export enum TransactionTypeEnum {
  Add = "add-money",
  Withdraw = "withdraw-money",
  Send = "send-money",
  CashIn = "cash-in",
  CashOut = "cash-out",
  Reversal = "reversal",
}

export enum TransactionStatusEnum {
  Pending = "pending",
  Completed = "completed",
  Reversed = "reversed",
}

export enum TransactionSourceEnum {
  Bank = "bank",
  Card = "card",
  Bkash = "bkash",
}

export interface ITransaction {
  _id?: Types.ObjectId;

  type: TransactionTypeEnum;
  amount: number;
  status: TransactionStatusEnum;

  sender?: Types.ObjectId; // The user or agent whose wallet is being debited
  receiver?: Types.ObjectId; // The user or agent whose wallet is being credited
  source?: TransactionSourceEnum;
  reversalOf?: Types.ObjectId;

  createdBy: Types.ObjectId;

  fee?: number;
  commission?: number;

  // notification
  notifySender?: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}
