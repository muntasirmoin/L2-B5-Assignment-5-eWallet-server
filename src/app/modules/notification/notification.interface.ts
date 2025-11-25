import { Types } from "mongoose";
import { TransactionTypeEnum } from "../transaction/transaction.interface";

export interface INotification {
  _id?: Types.ObjectId;
  user: Types.ObjectId; // receiver of the notification
  title: string;
  message: TransactionTypeEnum;
  type: string;
  seen: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
