import bcryptjs from "bcryptjs";
import httpStatus from "http-status-codes";
import AppError from "../../helpers/AppError";
import { IUser, Role } from "./user.interface";
import { User } from "./user.model";
import { envVars } from "../../config/env";
import { Wallet } from "../wallet/wallet.model";

const createUser = async (payload: Partial<IUser>) => {
  const { phone, pin, ...rest } = payload;
  const session = await User.startSession();
  session.startTransaction();

  try {
    const isUserExist = await User.findOne({ phone }).session(session);

    if (isUserExist) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "An account with this phone number already exists."
      );
    }

    const hashedPin = await bcryptjs.hash(
      pin as string,
      Number(envVars.BCRYPT_SALT_ROUND)
    );

    const user = await User.create(
      [
        {
          phone,
          pin: hashedPin,
          ...rest,
        },
      ],
      { session }
    );

    if (user[0].role === Role.USER || user[0].role === Role.AGENT) {
      await Wallet.create(
        [
          {
            user: user[0]._id,
            balance: 50,
          },
        ],
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();

    return user[0];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    throw error;
  }
};

const getMe = async (userId: string) => {
  const user = await User.findById(userId).select("-pin");
  return {
    data: user,
  };
};

export const changeAgentApprovalStatus = async (
  userId: string,
  isAgentApproved: boolean
) => {
  const updatedAgent = await User.findByIdAndUpdate(
    userId,
    { isAgentApproved },
    { new: true, runValidators: true }
  );

  if (!updatedAgent) {
    throw new AppError(httpStatus.NOT_FOUND, "Account not found!");
  }

  if (updatedAgent.role !== "agent") {
    throw new AppError(httpStatus.BAD_REQUEST, "This is not an agent Account!");
  }

  return updatedAgent;
};

const getUsersByRole = async (role: string) => {
  const users = await User.find({ role }).select("-pin");
  console.log(users);
  return users;
};

export const UserServices = {
  createUser,
  getMe,
  changeAgentApprovalStatus,
  getUsersByRole,
};
