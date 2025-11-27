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

const markNotificationSeen = catchAsync(async (req: Request, res: Response) => {
  const notification = await Notification.findByIdAndUpdate(
    req.params.id,
    { seen: true },
    { new: true }
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Notification marked as seen",
    data: notification,
  });
});

export const NotificationController = {
  getMyNotifications,
  markNotificationSeen,
};
