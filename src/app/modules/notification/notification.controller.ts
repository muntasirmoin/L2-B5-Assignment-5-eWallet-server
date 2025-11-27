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

const markAllNotificationsSeen = catchAsync(
  async (req: Request, res: Response) => {
    const { userId } = req.user as JwtPayload;

    await Notification.updateMany(
      { user: userId, seen: false },
      { seen: true }
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "All notifications marked as seen",
      data: null,
    });
  }
);

export const NotificationController = {
  getMyNotifications,
  markNotificationSeen,
  markAllNotificationsSeen,
};
