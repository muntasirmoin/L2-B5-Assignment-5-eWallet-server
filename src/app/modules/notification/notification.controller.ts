import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { Notification } from "./notification.model";
import { JwtPayload } from "jsonwebtoken";

// Get notifications for the logged-in user
const getMyNotifications = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    return sendResponse(res, {
      statusCode: httpStatus.UNAUTHORIZED,
      success: false,
      message: "Unauthorized: Missing or invalid token",
      data: undefined,
    });
  }

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

// Mark a single notification as seen
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

// Mark all notifications as seen for the logged-in user
const markAllNotificationsSeen = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.user) {
      return sendResponse(res, {
        statusCode: httpStatus.UNAUTHORIZED,
        success: false,
        message: "Unauthorized: Missing or invalid token",
        data: undefined,
      });
    }

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
