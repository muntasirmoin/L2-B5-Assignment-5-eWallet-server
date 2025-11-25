import { Types } from "mongoose";

export interface INotification {
  _id?: Types.ObjectId;
  user: Types.ObjectId; // receiver of the notification
  title: string;
  message: string;
  type: string;
  seen: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
