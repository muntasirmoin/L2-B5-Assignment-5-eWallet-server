import AppError from "../../helpers/AppError";
import httpStatus from "http-status-codes";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { Role } from "../user/user.interface";
import Transaction from "./transaction.model";

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

  const queryTransaction: any = {
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

export const TransactionService = {
  getMyTransactions,
  getAllTransactions,
};
