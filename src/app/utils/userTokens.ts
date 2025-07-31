import { JwtPayload } from "jsonwebtoken";
import { StatusCodes as httpStatus } from "http-status-codes";
import { generateToken, verifyToken } from "./jwt";
import { IUser } from "../modules/user/user.interface";
import { envVars } from "../config/env";
import AppError from "../helpers/AppError";
import { User } from "../modules/user/user.model";

export const createUserTokens = (user: Partial<IUser>) => {
  const jwtPayload = {
    userId: user._id,
    phone: user.phone,
    role: user.role,
  };
  const accessToken = generateToken(
    jwtPayload,
    envVars.JWT_ACCESS_SECRET,
    envVars.JWT_ACCESS_EXPIRES
  );

  const refreshToken = generateToken(
    jwtPayload,
    envVars.JWT_REFRESH_SECRET,
    envVars.JWT_REFRESH_EXPIRES
  );

  return {
    accessToken,
    refreshToken,
  };
};

export const createNewAccessTokenWithRefreshToken = async (
  refreshToken: string
) => {
  const verifiedRefreshToken = verifyToken(
    refreshToken,
    envVars.JWT_REFRESH_SECRET
  ) as JwtPayload;

  const isUserExist = await User.findOne({ phone: verifiedRefreshToken.phone });

  if (!isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "Account does not exist");
  }
  if (isUserExist.isBlocked === true) {
    throw new AppError(httpStatus.BAD_REQUEST, `Account is Blocked`);
  }

  if (isUserExist.isDeleted) {
    throw new AppError(httpStatus.BAD_REQUEST, "Account is deleted");
  }

  const jwtPayload = {
    userId: isUserExist._id,
    phone: isUserExist.phone,
    role: isUserExist.role,
  };
  const accessToken = generateToken(
    jwtPayload,
    envVars.JWT_ACCESS_SECRET,
    envVars.JWT_ACCESS_EXPIRES
  );

  return accessToken;
};
