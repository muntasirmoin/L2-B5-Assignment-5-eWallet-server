// modules/notification/notification.controller.ts
import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { Notification } from "./notification.model";
import { JwtPayload } from "jsonwebtoken";

const getMyNotifications = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user as JwtPayload;

  const notifications = await Notification.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(50);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Notifications retrieved successfully",
    data: notifications,
  });
});

export const NotificationController = {
  getMyNotifications,
};
