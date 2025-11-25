import { Types } from "mongoose";

export interface INotification {
  _id?: Types.ObjectId;
  user: Types.ObjectId; // receiver of the notification
}
