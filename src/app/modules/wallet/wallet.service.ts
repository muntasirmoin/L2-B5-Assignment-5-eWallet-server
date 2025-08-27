import httpStatus from "http-status-codes";
import { WalletStatus } from "./wallet.interface";
import { Wallet } from "./wallet.model";
import AppError from "../../helpers/AppError";
import Transaction from "../transaction/transaction.model";
import {
  TransactionSourceEnum,
  TransactionStatusEnum,
  TransactionTypeEnum,
} from "../transaction/transaction.interface";
import { User } from "../user/user.model";
import { Role } from "../user/user.interface";
import { QueryBuilder } from "../../utils/QueryBuilder";

const updateWalletIsBlockStatus = async (
  walletId: string,
  payload: { isBlocked: WalletStatus }
) => {
  const { isBlocked } = payload;

  const wallet = await Wallet.findById(walletId);

  if (!wallet) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Wallet not found for Block update!"
    );
  }

  if (wallet.isBlocked === isBlocked) {
    throw new AppError(httpStatus.CONFLICT, `Wallet is already ${isBlocked}!`);
  }
  // const updatedWallet = await Wallet.findByIdAndUpdate(
  //   walletId,
  //   { isBlocked },
  //   { new: true, runValidators: true }
  // );
  wallet.isBlocked = isBlocked;
  const updatedWallet = await wallet.save();

  const timestamp = new Date().toLocaleString();
  console.log(
    `[Notification] Wallet Block Status: ${wallet.isBlocked} Time: ${timestamp}`
  );

  return updatedWallet;
};

const getAllWallet = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(Wallet.find(), query);

  const allWalletData = queryBuilder.filter().sort().fields().paginate();

  const timestamp = new Date().toLocaleString();
  console.log(
    `[Notification] All Wallet retrieved successfully at Time: ${timestamp}`
  );

  const [data, meta] = await Promise.all([
    allWalletData.build(),
    queryBuilder.getMeta(),
  ]);

  return {
    data,
    meta,
  };
};

const addMoney = async (userId: string, amount: number, source: string) => {
  const session = await Wallet.startSession();
  session.startTransaction();

  try {
    const userExists = await User.exists({ _id: userId });

    if (!userExists) {
      throw new AppError(404, "User account does not exist.");
    }
    if (!userId) {
      throw new AppError(401, "Account does not exist");
    }
    if (
      !Object.values(TransactionSourceEnum).includes(
        source as TransactionSourceEnum
      )
    ) {
      throw new AppError(
        404,
        `Source of add money does not exist. Please add source ["${Object.values(
          TransactionSourceEnum
        ).join('" or "')}"].`
      );
    }
    if (!amount || typeof amount !== "number" || amount <= 0) {
      throw new AppError(400, "Amount must be a positive number");
    }

    const wallet = await Wallet.findOne({ user: userId }).session(session);

    if (!wallet) {
      throw new AppError(404, "Wallet not found");
    }

    if (wallet.isBlocked === WalletStatus.BLOCKED) {
      throw new AppError(403, "Wallet is blocked");
    }

    amount = Number(amount.toFixed(2));
    // wallet.balance += amount;
    // wallet.balance = Number(wallet.balance.toFixed(2));
    // await wallet.save({ session });

    const [transaction] = await Transaction.create(
      [
        {
          type: TransactionTypeEnum.Add,
          amount,
          status: TransactionStatusEnum.Pending,
          source,
          receiver: userId,
          createdBy: userId,
        },
      ],
      { session }
    );

    const timestamp = new Date().toLocaleString();
    console.log(
      `[Notification] Add-money transaction ${transaction._id} created! Amount: ${amount}. Status: ${transaction.status}. Time: ${timestamp}`
    );

    const message = `Transaction created. Waiting for confirmation. Transaction Id :${transaction._id}`;

    await session.commitTransaction();
    session.endSession();
    return { message, transaction };
    // return { wallet, transaction };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    throw error;
  }
};

// adddMoney as cash in

const addMoneyAsCashIn = async (
  userId: string,
  amount: number,
  source: string
) => {
  const session = await Wallet.startSession();
  session.startTransaction();

  try {
    const userExists = await User.exists({ _id: userId });

    if (!userExists) {
      throw new AppError(404, "User account does not exist.");
    }
    if (!userId) {
      throw new AppError(401, "Account does not exist");
    }
    if (
      !Object.values(TransactionSourceEnum).includes(
        source as TransactionSourceEnum
      )
    ) {
      throw new AppError(
        404,
        `Source of add money does not exist. Please add source ["${Object.values(
          TransactionSourceEnum
        ).join('" or "')}"].`
      );
    }
    if (!amount || typeof amount !== "number" || amount <= 0) {
      throw new AppError(400, "Amount must be a positive number");
    }

    const wallet = await Wallet.findOne({ user: userId }).session(session);

    if (!wallet) {
      throw new AppError(404, "Wallet not found");
    }

    if (wallet.isBlocked === WalletStatus.BLOCKED) {
      throw new AppError(403, "Wallet is blocked");
    }

    amount = Number(amount.toFixed(2));
    // wallet.balance += amount;
    // wallet.balance = Number(wallet.balance.toFixed(2));
    // await wallet.save({ session });

    const [transaction] = await Transaction.create(
      [
        {
          type: TransactionTypeEnum.CashIn,
          amount,
          status: TransactionStatusEnum.Pending,
          source,
          receiver: userId,
          createdBy: userId,
        },
      ],
      { session }
    );

    const timestamp = new Date().toLocaleString();
    console.log(
      `[Notification] Add-money transaction ${transaction._id} created! Amount: ${amount}. Status: ${transaction.status}. Time: ${timestamp}`
    );

    const message = `Transaction created. Waiting for confirmation. Transaction Id :${transaction._id}`;

    await session.commitTransaction();
    session.endSession();
    return { message, transaction };
    // return { wallet, transaction };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    throw error;
  }
};

//

const sendMoney = async (
  senderId: string,
  receiverId: string,
  amount: number
) => {
  if (senderId === receiverId) {
    throw new AppError(400, "Same sender & receiver.");
  }

  if (!senderId) {
    throw new AppError(401, "Sender ID is missing.");
  }
  if (!receiverId) {
    throw new AppError(401, "Receiver ID is missing.");
  }
  if (!amount || typeof amount !== "number" || amount <= 0) {
    throw new AppError(400, "Amount must be a positive number.");
  }

  const senderExists = await User.findOne({ _id: senderId });

  if (!senderExists) {
    throw new AppError(404, "Sender account does not exist.");
  }

  if (senderExists.isBlocked) {
    throw new AppError(404, "sender account is blocked.");
  }
  if (senderExists.isDeleted) {
    throw new AppError(404, "sender account is deleted.");
  }

  const receiverExists = await User.findOne({ _id: receiverId });

  if (!receiverExists) {
    throw new AppError(404, "Receiver account does not exist.");
  }

  if (receiverExists.isBlocked) {
    throw new AppError(404, "Receiver account is blocked.");
  }
  if (receiverExists.isDeleted) {
    throw new AppError(404, "Receiver account is deleted.");
  }

  if (receiverExists.role !== Role.USER) {
    throw new AppError(400, "Receiver must be a  User.");
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
      throw new AppError(403, "Your wallet is blocked.");
    }

    if (receiverWallet.isBlocked === WalletStatus.BLOCKED) {
      throw new AppError(403, "Receiver wallet is blocked.");
    }

    if (senderWallet.balance < amount) {
      throw new AppError(
        400,
        `Insufficient send money balance ${amount} ${senderWallet.currency}! Your Balance is :${senderWallet.balance}${senderWallet.currency}!`
      );
    }

    // Update balances
    // senderWallet.balance -= amount;
    // senderWallet.balance = Number(senderWallet.balance.toFixed(2));
    // receiverWallet.balance += amount;
    // receiverWallet.balance = Number(receiverWallet.balance.toFixed(2));

    // await senderWallet.save({ session });
    // await receiverWallet.save({ session });

    const [transaction] = await Transaction.create(
      [
        {
          type: TransactionTypeEnum.Send,
          amount,
          status: TransactionStatusEnum.Pending,
          sender: senderId,
          receiver: receiverId,
          createdBy: senderId,
        },
      ],
      { session }
    );

    const timestamp = new Date().toLocaleString();
    console.log(
      `[Notification] Send-Money transaction Id:${transaction._id}! status:${transaction.status} created by user ${senderId} to user ${receiverId}. Amount: ${amount}. Time: ${timestamp}`
    );
    const message = `Transaction created. Waiting for confirmation. Transaction Id :${transaction._id}`;

    await session.commitTransaction();
    session.endSession();
    return { message, transaction };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const withdraw = async (userId: string, source: string, amount: number) => {
  if (!userId) {
    throw new AppError(401, "user  ID is missing.");
  }

  if (!amount || typeof amount !== "number" || amount <= 0) {
    throw new AppError(400, "Amount must be a positive number.");
  }

  const userExists = await User.exists({ _id: userId });

  if (!userExists) {
    throw new AppError(404, "User account does not exist.");
  }

  const session = await Wallet.startSession();
  session.startTransaction();

  try {
    const userWallet = await Wallet.findOne({ user: userId }).session(session);

    if (!userWallet) {
      throw new AppError(404, "User  wallet not found.");
    }
    if (
      !Object.values(TransactionSourceEnum).includes(
        source as TransactionSourceEnum
      )
    ) {
      throw new AppError(
        404,
        `Source of withdraw money does not exist. Please add source ["${Object.values(
          TransactionSourceEnum
        ).join('" or "')}"].`
      );
    }

    if (userWallet.isBlocked === WalletStatus.BLOCKED) {
      throw new AppError(403, "Your wallet is blocked.");
    }

    if (userWallet.balance < amount) {
      throw new AppError(
        400,
        `Insufficient withdraw balance ${amount} ${userWallet.currency}! Your Balance is :${userWallet.balance}${userWallet.currency}!`
      );
    }

    // Update balances
    // userWallet.balance -= amount;
    // userWallet.balance = Number(userWallet.balance.toFixed(2));

    // await userWallet.save({ session });

    const [transaction] = await Transaction.create(
      [
        {
          type: TransactionTypeEnum.Withdraw,
          amount,
          source,
          status: TransactionStatusEnum.Pending,
          sender: userId,

          createdBy: userId,
        },
      ],
      { session }
    );

    const timestamp = new Date().toLocaleString();
    console.log(
      `[Notification] Withdraw-money transaction ${transaction._id} created! Amount: ${amount}. Status: ${transaction.status}. Time: ${timestamp}`
    );

    const message = `Transaction created. Waiting for confirmation. Transaction Id :${transaction._id}`;

    await session.commitTransaction();
    session.endSession();
    return { message, transaction };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const getMyWallet = async (userId: string) => {
  if (!userId) {
    throw new AppError(401, "user  ID is missing.");
  }

  const myWallet = await Wallet.findOne({ user: userId }).populate(
    "user",
    "name"
  );

  if (!myWallet) {
    throw new AppError(404, "Wallet not found for this user.");
  }

  const timestamp = new Date().toLocaleString();
  console.log(
    `[Notification] My Wallet retrieved successfully! Balance: ${myWallet.balance}, Time: ${timestamp}`
  );

  return { myWallet };
};

export const WalletServices = {
  updateWalletIsBlockStatus,
  getAllWallet,
  addMoney,
  sendMoney,
  addMoneyAsCashIn,
  withdraw,
  getMyWallet,
};
