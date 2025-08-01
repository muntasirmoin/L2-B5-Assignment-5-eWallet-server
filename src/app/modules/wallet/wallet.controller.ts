import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { WalletServices } from "./wallet.service";

const updateWalletIsBlockStatus = catchAsync(
  async (req: Request, res: Response) => {
    const walletId = req.params.id;
    const { isBlocked } = req.body;

    const updatedWallet = await WalletServices.updateWalletIsBlockStatus(
      walletId,
      { isBlocked }
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `Wallet ${
        isBlocked === "blocked" ? "blocked" : "unblocked"
      } successfully`,
      data: updatedWallet,
    });
  }
);

const getAllWallet = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;

  const result = await WalletServices.getAllWallet(
    query as Record<string, string>
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `All Wallet retrieved successfully`,
    data: result.data,
    meta: result.meta,
  });
});

const addMoney = catchAsync(async (req: Request, res: Response) => {
  const decodeToken = req.user as JwtPayload;

  const userId = decodeToken.userId;
  const { amount, source } = req.body;

  const wallet = await WalletServices.addMoney(userId, amount, source);

  res.status(200).json({
    success: true,
    message: wallet.message, //"Money added successfully",
    data: wallet.transaction,
  });
});

const sendMoney = catchAsync(async (req: Request, res: Response) => {
  const decodeToken = req.user as JwtPayload;

  const senderId = decodeToken.userId;
  const { receiverUserId: receiver, amount } = req.body;

  const result = await WalletServices.sendMoney(senderId, receiver, amount);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message, //"Money sent successfully",
    data: result.transaction,
  });
});

const withdraw = catchAsync(async (req: Request, res: Response) => {
  const decodeToken = req.user as JwtPayload;

  const userId = decodeToken.userId;
  const { source, amount } = req.body;

  const result = await WalletServices.withdraw(userId, source, amount);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message, //"Cash Withdraw successfully",
    data: result.transaction,
  });
});

const getMyWallet = catchAsync(async (req: Request, res: Response) => {
  const decodeToken = req.user as JwtPayload;

  const userId = decodeToken.userId;

  const result = await WalletServices.getMyWallet(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "My Wallet retrieved successfully",
    data: result,
  });
});
export const WalletControllers = {
  updateWalletIsBlockStatus,
  getAllWallet,
  addMoney,
  sendMoney,

  withdraw,
  getMyWallet,
};
