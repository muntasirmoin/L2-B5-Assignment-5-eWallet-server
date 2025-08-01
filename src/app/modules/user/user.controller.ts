import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { UserServices } from "./user.service";
import { Role } from "./user.interface";

const createUser = catchAsync(async (req: Request, res: Response) => {
  const user = await UserServices.createUser(req.body);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { pin: pass, ...rest } = user.toObject();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Your account has been created successfully",
    data: rest,
  });
});

const getMe = catchAsync(async (req: Request, res: Response) => {
  const decodedToken = req.user as JwtPayload;
  console.log("req.user", req.user);
  const result = await UserServices.getMe(decodedToken.userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Your profile Retrieved Successfully",
    data: result.data,
  });
});

export const changeAgentApprovalStatus = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.params.id;
    console.log("userId:  ", userId);
    const { isAgentApproved } = req.body;

    const updatedAgent = await UserServices.changeAgentApprovalStatus(
      userId,
      isAgentApproved
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `Agent has been ${
        isAgentApproved ? "approved" : "suspended"
      } successfully.`,
      data: updatedAgent,
    });
  }
);

export const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const role = Role.USER;

  const validRoles = Object.values(Role).filter((role) => role !== Role.ADMIN);
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

  const result = await UserServices.getAllUsers(
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
});

const updateUser = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.id;

  const verifiedToken = req.user;

  const payload = req.body;
  const user = await UserServices.updateUser(
    userId,
    payload,
    verifiedToken as JwtPayload
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User Profile Updated Successfully",
    data: user,
  });
});

const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const decodedToken = req.user as JwtPayload;
  const userId = decodedToken.userId;
  const payload = req.body;

  const user = await UserServices.updateProfile(userId, payload);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Your Profile Updated Successfully",
    data: user,
  });
});

export const UserControllers = {
  createUser,
  getMe,
  changeAgentApprovalStatus,
  getAllUsers,
  updateUser,
  updateProfile,
};
