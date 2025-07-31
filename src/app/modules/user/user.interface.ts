import { Types } from "mongoose";

export enum Role {
  USER = "user",
  AGENT = "agent",
  ADMIN = "admin",
}

export interface IUser {
  _id?: Types.ObjectId;

  name: string;
  phone: string;
  email?: string;

  pin: string;
  role: Role;

  isBlocked: boolean;
  isAgentApproved?: boolean;
  isDeleted?: boolean;

  picture?: string;
  address?: string;

  commissionRate?: number;
  permissionLevel?: number;

  createdAt?: Date;
  updatedAt?: Date;
}
