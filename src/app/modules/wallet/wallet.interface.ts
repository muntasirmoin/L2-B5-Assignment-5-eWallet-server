import { Types } from "mongoose";

export enum WalletStatus {
  BLOCKED = "blocked",
  UNBLOCKED = "unblocked",
}

export interface IWallet {
  user: Types.ObjectId;
  balance: number;
  isBlocked: WalletStatus;
  createdAt?: Date;
  updatedAt?: Date;

  currency?: string;
}
