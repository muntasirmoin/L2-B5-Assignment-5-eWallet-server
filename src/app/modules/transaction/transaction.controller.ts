import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { TransactionService } from "./transaction.service";

const getMyTransactions = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const { userId, role } = req.user as JwtPayload;

  const result = await TransactionService.getMyTransactions(
    userId,
    role,
    query as Record<string, string>
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Transaction history retrieved successfully.",
    data: result.data,
    meta: result.meta,
  });
});

const getAllTransactions = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;

    const result = await TransactionService.getAllTransactions(
      query as Record<string, string>
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: `All Transaction retrieved successfully`,
      data: result.data,
      meta: result.meta,
    });
  }
);

const reverseTransaction = catchAsync(async (req: Request, res: Response) => {
  const adminId = (req.user as JwtPayload).userId;
  const transactionId = req.params.id;

  const reversal = await TransactionService.reverseTransaction(
    transactionId,
    adminId
  );

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Transaction reversed successfully.",
    data: reversal,
  });
});

const singleTransaction = catchAsync(async (req: Request, res: Response) => {
  const transactionId = req.params.id;

  const reversal = await TransactionService.singleTransaction(transactionId);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Single Transaction Retrieved successfully.",
    data: reversal,
  });
});

const getMyCommission = catchAsync(async (req: Request, res: Response) => {
  const decodeToken = req.user as JwtPayload;

  const userId = decodeToken.userId;

  const result = await TransactionService.getMyCommission(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "My Wallet Commission history successfully",
    data: result,
  });
});

const completeTransaction = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as JwtPayload).userId;
  const transactionId = req.params.id;

  const completeTx = await TransactionService.completeTransaction(
    transactionId,
    userId
  );

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Transaction Completed successfully.",
    data: completeTx,
  });
});

export const TransactionController = {
  getMyTransactions,
  getAllTransactions,
  reverseTransaction,
  singleTransaction,
  getMyCommission,
  completeTransaction,
};
