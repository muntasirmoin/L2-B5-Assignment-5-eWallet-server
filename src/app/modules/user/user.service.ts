import bcryptjs from "bcryptjs";
import httpStatus from "http-status-codes";
import AppError from "../../helpers/AppError";
import { IUser, Role } from "./user.interface";
import { User } from "./user.model";
import { envVars } from "../../config/env";
import { Wallet } from "../wallet/wallet.model";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { JwtPayload } from "jsonwebtoken";

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

    const timestamp = new Date().toLocaleString();
    console.log(
      `[Notification] Account Created Successfully! at Time: ${timestamp}`
    );

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
  if (!user) {
    throw new AppError(404, "Not found!Your Profile!");
  }
  const timestamp = new Date().toLocaleString();
  console.log(
    `[Notification] Your profile Retrieved Successfully! at Time: ${timestamp}`
  );
  return {
    data: user,
  };
};

export const changeAgentApprovalStatus = async (
  userId: string,
  isAgentApproved: boolean
) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "Account not found!");
  }

  if (user.role !== "agent") {
    throw new AppError(httpStatus.BAD_REQUEST, "This is not an agent Account!");
  }

  if (user.isAgentApproved === isAgentApproved) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `This agent Account is already ${
        isAgentApproved ? "Approved" : "Suspend"
      }!`
    );
  }

  const updatedAgent = await User.findByIdAndUpdate(
    userId,
    { isAgentApproved },
    { new: true, runValidators: true, select: "-pin" }
  );
  // Update approval status
  // user.isAgentApproved = isAgentApproved;
  // const updatedAgent = await user.save();
  const timestamp = new Date().toLocaleString();
  console.log(
    `[Notification] Agent Approval Updated Successfully! at Time: ${timestamp}`
  );

  return updatedAgent;
};

const getAllUsers = async (role: string, query: Record<string, string>) => {
  const booleanFields = ["isBlocked"];

  const queryBuilder = new QueryBuilder(
    User.find({ role }).select("-pin"),
    query,
    booleanFields
  );
  const searchableFields = [
    "name",
    "phone",
    "email",
    "role",
    "address",
    "isBlocked",
  ];
  // const allUserData = queryBuilder.filter().sort().fields().paginate();
  const allUserData = queryBuilder
    .search(searchableFields)
    .filter()
    .sort()
    .fields()
    .paginate();

  const [data, meta] = await Promise.all([
    allUserData.build(),
    queryBuilder.getMeta(),
  ]);

  const timestamp = new Date().toLocaleString();
  console.log(
    `[Notification] All users retrieved successfully! at Time: ${timestamp}`
  );
  return {
    data,
    meta,
  };
};

const updateUser = async (
  userId: string,
  payload: Partial<IUser>,
  decodedToken: JwtPayload
) => {
  const ifUserExist = await User.findById(userId);

  if (!ifUserExist) {
    throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
  }

  if (ifUserExist.isDeleted) {
    throw new AppError(403, "User is not allowed to be updated Its Deleted");
  }

  if ("pin" in payload || "phone" in payload) {
    throw new AppError(400, "Cannot update phone number or PIN here.");
  }

  if ("isAgentApproved" in payload) {
    const isAdmin = decodedToken.role === Role.ADMIN;
    const isTargetAgent = ifUserExist.role === Role.AGENT;

    if (!isAdmin || !isTargetAgent) {
      throw new AppError(
        403,
        `Only can update 'isAgentApproved'-- only for users with the 'agent' role. This Account role is:${ifUserExist.role}`
      );
    }
  }

  const isAdmin = decodedToken.role === Role.ADMIN;
  const isTargetAdmin = ifUserExist.role === Role.ADMIN;

  if (
    isAdmin &&
    isTargetAdmin &&
    payload.role &&
    payload.role !== ifUserExist.role
  ) {
    throw new AppError(403, "Admins cannot change the role of other admins.");
  }

  if (
    isAdmin &&
    userId === decodedToken.userId &&
    payload.role &&
    payload.role !== ifUserExist.role
  ) {
    throw new AppError(403, "Admins cannot change their own role.");
  }

  const allowedFields = [
    "name",
    "email",
    "address",
    "picture",
    "role",
    "isBlocked",
    "commissionRate",
    "permissionLevel",
    "isAgentApproved",
  ];

  const sanitizedPayload = Object.fromEntries(
    Object.entries(payload).filter(([key]) => allowedFields.includes(key))
  );

  if (Object.keys(sanitizedPayload).length === 0) {
    throw new AppError(400, "No valid fields provided for update.");
  }

  const updatedUser = await User.findByIdAndUpdate(userId, sanitizedPayload, {
    new: true,
    runValidators: true,
  }).select("-pin");

  const timestamp = new Date().toLocaleString();
  console.log(
    `[Notification]Profile Update By Admin Using User Id Successfully! at Time: ${timestamp}`
  );

  return updatedUser;
};

const updateProfile = async (userId: string, payload: Partial<IUser>) => {
  const ifUserExist = await User.findById(userId);

  if (!ifUserExist) {
    throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
  }

  if (ifUserExist.isBlocked || ifUserExist.isDeleted) {
    throw new AppError(403, "User is not allowed to be updated");
  }
  // muntasir
  if ("pin" in payload) {
    throw new AppError(400, "Cannot update phone number or PIN here.");
  }

  if ("role" in payload) {
    throw new AppError(403, "You cannot change your role from your profile.");
  }
  const forbiddenFields = [
    "isBlocked",
    "permissionLevel",
    "commissionRate",
    "isAgentApproved",
  ];
  for (const field of forbiddenFields) {
    if (field in payload) {
      throw new AppError(
        403,
        `You cannot update '${field}' from your profile.`
      );
    }
  }

  const allowedFields = ["name", "email", "address", "picture", "phone"];

  const sanitizedPayload = Object.fromEntries(
    Object.entries(payload).filter(([key]) => allowedFields.includes(key))
  );

  if (Object.keys(sanitizedPayload).length === 0) {
    throw new AppError(400, "No valid fields provided for update.");
  }

  const updatedUser = await User.findByIdAndUpdate(userId, sanitizedPayload, {
    new: true,
    runValidators: true,
  }).select("-pin");

  const timestamp = new Date().toLocaleString();
  console.log(
    `[Notification]Profile Updated Successfully! at Time: ${timestamp}`
  );

  return updatedUser;
};

//

const getUserByNumber = async (phone: string) => {
  return await User.findOne({ phone });
};

//

export const UserServices = {
  createUser,
  getMe,
  changeAgentApprovalStatus,
  getAllUsers,
  updateUser,
  updateProfile,
  getUserByNumber,
};
