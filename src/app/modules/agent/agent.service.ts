import AppError from "../../helpers/AppError";
import {
  TransactionStatusEnum,
  TransactionTypeEnum,
} from "../transaction/transaction.interface";
import Transaction from "../transaction/transaction.model";
import { Role } from "../user/user.interface";
import { User } from "../user/user.model";
import { WalletStatus } from "../wallet/wallet.interface";
import { Wallet } from "../wallet/wallet.model";

const cashIn = async (senderId: string, receiverId: string, amount: number) => {
  if (senderId === receiverId) {
    throw new AppError(400, "Same agent & cash-in receiver.");
  }

  if (!senderId) {
    throw new AppError(401, "Agent ID is missing.");
  }
  if (!receiverId) {
    throw new AppError(401, "cash In Receiver ID is missing.");
  }
  if (!amount || typeof amount !== "number" || amount <= 0) {
    throw new AppError(400, "Amount must be a positive number.");
  }

  const senderExists = await User.exists({ _id: senderId });

  if (!senderExists) {
    throw new AppError(404, "Agent account does not exist.");
  }

  const receiverExists = await User.findOne({ _id: receiverId });

  if (!receiverExists) {
    throw new AppError(404, "Receiver account does not exist.");
  }

  if (receiverExists.role !== Role.USER) {
    throw new AppError(400, "Receiver must be a  User Role ObjectId.");
  }

  const session = await Wallet.startSession();
  session.startTransaction();

  try {
    const senderWallet = await Wallet.findOne({ user: senderId }).session(
      session
    );

    const receiverWallet = await Wallet.findOne({ user: receiverId }).session(
      session
    );

    if (!senderWallet) {
      throw new AppError(404, "Sender  wallet not found.");
    }
    if (!receiverWallet) {
      throw new AppError(404, "Receiver wallet not found.");
    }

    if (senderWallet.isBlocked === WalletStatus.BLOCKED) {
      throw new AppError(403, "Your agent wallet is blocked.");
    }

    if (receiverWallet.isBlocked === WalletStatus.BLOCKED) {
      throw new AppError(403, "Receiver wallet is blocked.");
    }

    if (senderWallet.balance < amount) {
      throw new AppError(
        400,
        `Insufficient balance ${amount} ${senderWallet.currency}! Your Balance is :${senderWallet.balance}${senderWallet.currency}!`
      );
    }

    // Update balances
    senderWallet.balance -= amount;
    senderWallet.balance = Number(senderWallet.balance.toFixed(2));
    receiverWallet.balance += amount;
    receiverWallet.balance = Number(receiverWallet.balance.toFixed(2));

    await senderWallet.save({ session });
    await receiverWallet.save({ session });

    const [transaction] = await Transaction.create(
      [
        {
          type: TransactionTypeEnum.CashIn,
          amount,
          status: TransactionStatusEnum.Completed,
          sender: senderId,
          receiver: receiverId,
          createdBy: senderId,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();
    return { myAgentWallet: senderWallet, transaction };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

// receiver = user
// sender = agent

const cashOut = async (
  senderId: string,
  receiverId: string,
  amount: number
) => {
  if (senderId === receiverId) {
    throw new AppError(400, "Same sender & Agent.");
  }

  if (!senderId) {
    throw new AppError(401, "Agent ID is missing.");
  }
  if (!receiverId) {
    throw new AppError(401, " User ID is missing.");
  }
  if (!amount || typeof amount !== "number" || amount <= 0) {
    throw new AppError(400, "Amount must be a positive number.");
  }

  const senderExists = await User.exists({ _id: senderId });

  if (!senderExists) {
    throw new AppError(404, "Agent account does not exist.");
  }

  const userExists = await User.findOne({ _id: receiverId });

  if (!userExists) {
    throw new AppError(404, "Receiver account does not exist.");
  }

  if (userExists.role !== Role.USER) {
    throw new AppError(400, "Receiver must be a  User Role ObjectId.");
  }

  const session = await Wallet.startSession();
  session.startTransaction();

  try {
    // agent wallet
    const senderWallet = await Wallet.findOne({ user: senderId }).session(
      session
    );

    const userWallet = await Wallet.findOne({ user: receiverId }).session(
      session
    );

    if (!senderWallet) {
      throw new AppError(404, "Agent  wallet not found.");
    }
    if (!userWallet) {
      throw new AppError(404, "Agent wallet not found.");
    }

    if (senderWallet.isBlocked === WalletStatus.BLOCKED) {
      throw new AppError(403, "Your wallet is blocked.");
    }

    if (userWallet.isBlocked === WalletStatus.BLOCKED) {
      throw new AppError(403, "User wallet is blocked.");
    }

    if (userWallet.balance < amount) {
      throw new AppError(
        400,
        `Insufficient User balance for Cash-Out: !!${amount} ${userWallet.currency}!!`
      );
    }
    // receiver = user
    // sender = agent
    // Update balances
    senderWallet.balance += amount;
    senderWallet.balance = Number(senderWallet.balance.toFixed(2));
    userWallet.balance -= amount;
    userWallet.balance = Number(userWallet.balance.toFixed(2));

    await senderWallet.save({ session }); //agent wallet
    await userWallet.save({ session });

    const [transaction] = await Transaction.create(
      [
        {
          type: TransactionTypeEnum.CashOut,
          amount,
          status: TransactionStatusEnum.Completed,
          sender: receiverId, //user
          receiver: senderId, //agent
          createdBy: senderId, //agent
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();
    return { myAgentWallet: senderWallet, transaction };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const AgentServices = {
  cashIn,
  cashOut,
};
