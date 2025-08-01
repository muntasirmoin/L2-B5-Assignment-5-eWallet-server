import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { AgentServices } from "./agent.service";
import { Role } from "../user/user.interface";

export const getAllAgents = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const role = Role.AGENT;

    const validRoles = Object.values(Role).filter(
      (role) => role !== Role.ADMIN
    );
    if (!validRoles.includes(role as Role.USER | Role.AGENT)) {
      return sendResponse(res, {
        statusCode: httpStatus.BAD_REQUEST,
        success: false,
        message:
          "Invalid role. Please specify either 'agent' or 'user' to retrieve all.",
        data: null,
      });
    }

    const query = req.query;

    const result = await AgentServices.getAllAgents(
      role,
      query as Record<string, string>
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: `All ${role}s retrieved successfully`,
      data: result.data,
      meta: result.meta,
    });
  }
);

const cashIn = catchAsync(async (req: Request, res: Response) => {
  const decodeToken = req.user as JwtPayload;

  const senderId = decodeToken.userId;
  const { userId: receiver, amount } = req.body;

  const result = await AgentServices.cashIn(senderId, receiver, amount);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Cash In successfully",
    data: result,
  });
});

const cashOut = catchAsync(async (req: Request, res: Response) => {
  const decodeToken = req.user as JwtPayload;

  const senderId = decodeToken.userId;
  const { receiver, amount } = req.body;
  // receiver = user
  // sender = agent
  const result = await AgentServices.cashOut(senderId, receiver, amount);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Cash Out successfully",
    data: result,
  });
});

export const AgentControllers = {
  cashIn,
  cashOut,
  getAllAgents,
};
