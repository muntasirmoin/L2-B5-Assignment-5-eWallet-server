import AppError from "../../helpers/AppError";
import httpStatus from "http-status-codes";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { Role } from "../user/user.interface";
import Transaction from "./transaction.model";
import {
  TransactionStatusEnum,
  TransactionTypeEnum,
} from "./transaction.interface";
import { Wallet } from "../wallet/wallet.model";
import { IWallet, WalletStatus } from "../wallet/wallet.interface";
import { Document } from "mongoose";
type WalletDocument = IWallet & Document;

const getMyTransactions = async (
  userId: string,
  role: Role,
  query: Record<string, string>
) => {
  //   const queryTransaction: any = {};

  if (role !== Role.USER && role !== Role.AGENT) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to view these transactions"
    );
  }

  const queryTransaction: Record<string, unknown> = {
    $or: [{ sender: userId }, { receiver: userId }, { createdBy: userId }],
  };

  const queryBuilder = new QueryBuilder(
    Transaction.find(queryTransaction).populate(
      "createdBy sender receiver",
      "name role"
    ),
    query
  );
  const myTransactionData = queryBuilder.filter().sort().fields().paginate();

  const [data, meta] = await Promise.all([
    myTransactionData.build(),
    queryBuilder.getMeta(),
  ]);

  const timestamp = new Date().toLocaleString();
  console.log(
    `[Notification]My Transactions retrieved! at ${timestamp}. Total records: ${data.length}`
  );

  return {
    data,
    meta,
  };

  //   const myTransaction = Transaction.find(queryTransaction)
  //     .sort({ createdAt: -1 })
  //     .populate("createdBy sender receiver", "name role");

  //   return myTransaction;
};

const getAllTransactions = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(Transaction.find(), query);

  const allWalletData = queryBuilder.filter().sort().fields().paginate();

  const [data, meta] = await Promise.all([
    allWalletData.build(),
    queryBuilder.getMeta(),
  ]);

  return {
    data,
    meta,
  };
};

const reverseTransaction = async (originalTxId: string, adminId: string) => {
  const session = await Transaction.startSession();
  session.startTransaction();

  try {
    const originalTx = await Transaction.findById(originalTxId).session(
      session
    );
    if (!originalTx) {
      throw new AppError(404, "Original transaction not found.");
    }
    if (originalTx.status === TransactionStatusEnum.Pending) {
      throw new AppError(400, "Cannot reverse a pending transaction.");
    }
    if (originalTx.status === TransactionStatusEnum.Reversed) {
      throw new AppError(400, "Transaction already reversed.");
    }

    const amount = originalTx.amount;

    // Reversal logic based on type
    let senderWallet: WalletDocument | null = null;
    let receiverWallet: WalletDocument | null = null;

    if (originalTx.sender) {
      senderWallet = await Wallet.findOne({ user: originalTx.sender }).session(
        session
      );
      if (!senderWallet) {
        throw new AppError(404, "Sender wallet not found.");
      }
    }

    if (originalTx.receiver) {
      receiverWallet = await Wallet.findOne({
        user: originalTx.receiver,
      }).session(session);
      if (!receiverWallet) {
        throw new AppError(404, "Receiver wallet not found.");
      }
    }

    // Balance checks and updates
    if (
      originalTx.type === TransactionTypeEnum.Send ||
      originalTx.type === TransactionTypeEnum.CashIn ||
      originalTx.type === TransactionTypeEnum.CashOut
    ) {
      if (!senderWallet) {
        throw new AppError(400, "Sender  wallet missing.");
      }
      if (!receiverWallet) {
        throw new AppError(400, "Receiver wallet missing.");
      }

      if (receiverWallet.balance < amount) {
        throw new AppError(
          400,
          "Receiver does not have sufficient balance for reversal."
        );
      }

      //commission add to the user wallet

      if (
        originalTx.type === TransactionTypeEnum.CashOut &&
        originalTx.commission
      ) {
        senderWallet.balance += originalTx.commission;
        senderWallet.balance = Number(senderWallet.balance.toFixed(2));
      }

      //Number(().toFixed(2));

      receiverWallet.balance -= amount;
      receiverWallet.balance = Number(receiverWallet.balance.toFixed(2));
      senderWallet.balance += amount;
      senderWallet.balance = Number(senderWallet.balance.toFixed(2));

      await receiverWallet.save({ session });
      await senderWallet.save({ session });
    }

    if (originalTx.type === TransactionTypeEnum.Add) {
      if (!receiverWallet)
        throw new AppError(400, "Wallet not found for refund.");
      if (receiverWallet.balance < amount)
        throw new AppError(
          400,
          "User has insufficient balance to reverse add-money."
        );
      receiverWallet.balance -= amount;
      receiverWallet.balance = Number(receiverWallet.balance.toFixed(2));
      await receiverWallet.save({ session });
    }

    if (originalTx.type === TransactionTypeEnum.Withdraw) {
      if (!senderWallet)
        throw new AppError(400, "Wallet not found for reversal.");
      senderWallet.balance += amount;
      senderWallet.balance = Number(senderWallet.balance.toFixed(2));
      await senderWallet.save({ session });
    }

    // Create reversal transaction
    const [reversalTx] = await Transaction.create(
      [
        {
          type: TransactionTypeEnum.Reversal,
          amount: amount,
          status: TransactionStatusEnum.Reversed,
          sender: originalTx.receiver ?? undefined,
          receiver: originalTx.sender ?? undefined,
          createdBy: adminId,
          reversalOf: originalTx._id,
          ...(originalTx.source && { source: originalTx.source }),
          ...(originalTx.commission && { commission: originalTx.commission }),
        },
      ],
      { session }
    );

    originalTx.status = TransactionStatusEnum.Reversed;
    await originalTx.save({ session });

    await session.commitTransaction();
    session.endSession();

    return reversalTx;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const singleTransaction = async (transactionId: string) => {
  const singleTransaction = await Transaction.findById(transactionId);

  return singleTransaction;
};

const getMyCommission = async (userId: string) => {
  if (!userId) {
    throw new AppError(401, "User ID is missing.");
  }

  const myCommissions = await Transaction.find({ receiver: userId }).populate(
    "receiver",
    "name"
  );

  const validCommissions = myCommissions.filter(
    (commission) =>
      commission.type === "cash-out" &&
      commission.status === TransactionStatusEnum.Completed
  );

  if (validCommissions.length > 0) {
    const totalCommission = validCommissions.reduce(
      (sum, tx) => sum + (tx.commission || 0),
      0
    );

    const timestamp = new Date().toLocaleString();
    console.log(
      `[Notification]My Wallet Commission history retrieved successfully! at Time: ${timestamp}`
    );

    return {
      totalCommission: Number(totalCommission.toFixed(2)),
      myCommissionTransactions: validCommissions,
    };
  } else {
    throw new AppError(
      400,
      "No commission added! You only get commission from cash-out type transactions."
    );
  }
};

const completeTransaction = async (originalTxId: string, userId: string) => {
  const session = await Transaction.startSession();
  session.startTransaction();

  try {
    const originalTx = await Transaction.findById(originalTxId).session(
      session
    );
    if (!originalTx) {
      throw new AppError(404, "Transaction not found.");
    }
    //  add
    if (originalTx.type === TransactionTypeEnum.Add) {
      if (originalTx.receiver?.toString() !== userId) {
        throw new AppError(
          httpStatus.FORBIDDEN,
          "You are not authorized to complete this transaction. It does not belong to you."
        );
      }
    }
    // withdraw
    if (originalTx.type === TransactionTypeEnum.Withdraw) {
      if (originalTx.sender?.toString() !== userId) {
        throw new AppError(
          httpStatus.FORBIDDEN,
          "You are not authorized to complete this transaction. It does not belong to you."
        );
      }
    }

    // send-money
    if (originalTx.type === TransactionTypeEnum.Send) {
      if (originalTx.sender?.toString() !== userId) {
        throw new AppError(
          httpStatus.FORBIDDEN,
          "You are not authorized to complete this transaction. It does not belong to you."
        );
      }
    }
    // status logic
    if (originalTx.status === TransactionStatusEnum.Completed) {
      throw new AppError(
        httpStatus.CONFLICT,
        "Transaction is already Completed"
      );
    }
    if (originalTx.status === TransactionStatusEnum.Reversed) {
      throw new AppError(httpStatus.CONFLICT, "Transaction already reversed.");
    }
    if (originalTx.status !== TransactionStatusEnum.Pending) {
      throw new AppError(
        httpStatus.CONFLICT,
        `"${originalTx.status}"! This Transaction status not Recognized!`
      );
    }

    const amount = Number(originalTx.amount.toFixed(2));
    // if (originalTx.type !== TransactionTypeEnum.Add )
    // type allowed for complete transaction
    const allowedTypes = [
      TransactionTypeEnum.Add,
      TransactionTypeEnum.Withdraw,
      TransactionTypeEnum.Send,
    ];

    if (!allowedTypes.includes(originalTx.type)) {
      throw new AppError(
        400,
        "Only 'Add-money' or 'Withdraw-money' transactions can be completed here."
      );
    }
    // add-money
    if (originalTx.type === TransactionTypeEnum.Add) {
      const userWallet = await Wallet.findOne({ user: userId }).session(
        session
      );

      if (!userWallet) {
        throw new AppError(404, "Wallet not found.");
      }
      if (userWallet.isBlocked === WalletStatus.BLOCKED) {
        throw new AppError(403, "Your wallet is blocked.");
      }

      userWallet.balance += amount;
      userWallet.balance = Number(userWallet.balance.toFixed(2));
      await userWallet.save({ session });
      originalTx.status = TransactionStatusEnum.Completed;
      await originalTx.save({ session });

      //
      const timestamp = new Date().toLocaleString();
      console.log(
        `[Notification] Transaction Id[add-money]: ${originalTx._id} marked as Completed! Amount: ${amount}. Time: ${timestamp}`
      );

      await session.commitTransaction();
      session.endSession();

      return userWallet;
    }

    // withdraw-money

    if (originalTx.type === TransactionTypeEnum.Withdraw) {
      const userWallet = await Wallet.findOne({ user: userId }).session(
        session
      );

      if (!userWallet) {
        throw new AppError(404, "Wallet not found.");
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

      // userWallet.balance -= amount;
      // userWallet.balance = Number(userWallet.balance.toFixed(2));

      // await userWallet.save({ session });

      userWallet.balance -= amount;
      userWallet.balance = Number(userWallet.balance.toFixed(2));
      await userWallet.save({ session });
      originalTx.status = TransactionStatusEnum.Completed;
      await originalTx.save({ session });

      //
      const timestamp = new Date().toLocaleString();
      console.log(
        `[Notification] Transaction Id[Withdraw]: ${originalTx._id} marked as Completed! Amount: ${amount}. Time: ${timestamp}`
      );

      await session.commitTransaction();
      session.endSession();

      return userWallet;
    }

    // send-money
    if (originalTx.type === TransactionTypeEnum.Send) {
      const senderWallet = await Wallet.findOne({ user: userId }).session(
        session
      );

      const receiverWallet = await Wallet.findOne({
        user: originalTx.receiver,
      }).session(session);

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
      senderWallet.balance -= amount;
      senderWallet.balance = Number(senderWallet.balance.toFixed(2));
      receiverWallet.balance += amount;
      receiverWallet.balance = Number(receiverWallet.balance.toFixed(2));

      await senderWallet.save({ session });
      await receiverWallet.save({ session });
      originalTx.status = TransactionStatusEnum.Completed;
      await originalTx.save({ session });
      const timestamp = new Date().toLocaleString();
      console.log(
        `[Notification] Transaction Id[send-money]: ${originalTx._id} marked as Completed! Amount: ${amount}. Time: ${timestamp}`
      );

      await session.commitTransaction();
      session.endSession();

      return senderWallet;
    }
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const TransactionService = {
  getMyTransactions,
  getAllTransactions,
  reverseTransaction,
  singleTransaction,
  getMyCommission,
  completeTransaction,
};
