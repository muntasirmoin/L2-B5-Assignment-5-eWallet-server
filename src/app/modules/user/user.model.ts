import { Schema, model } from "mongoose";
import { IUser, Role } from "./user.interface";

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String, lowercase: true },

    pin: { type: String, required: true },
    role: {
      type: String,
      enum: Object.values(Role),
      default: Role.USER,
    },

    isBlocked: { type: Boolean, default: false },
    isAgentApproved: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },

    picture: { type: String },
    address: { type: String },

    commissionRate: { type: Number },
    permissionLevel: { type: Number },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const User = model<IUser>("User", userSchema);
