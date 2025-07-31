import { Schema, model } from "mongoose";
import { IWallet, WalletStatus } from "./wallet.interface";

const walletSchema = new Schema<IWallet>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    balance: {
      type: Number,
      required: true,
      default: 50,
      min: 0,
    },
    isBlocked: {
      type: String,
      enum: Object.values(WalletStatus),
      default: WalletStatus.UNBLOCKED,
    },

    currency: {
      type: String,
      default: "BDT",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Wallet = model<IWallet>("Wallet", walletSchema);
