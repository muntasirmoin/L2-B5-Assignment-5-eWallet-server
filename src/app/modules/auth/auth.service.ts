import bcryptjs from "bcryptjs";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../../config/env";
import AppError from "../../helpers/AppError";
import { User } from "../user/user.model";
import { createNewAccessTokenWithRefreshToken } from "../../utils/userTokens";

const changePin = async (
  oldPin: string,
  newPin: string,
  decodedToken: JwtPayload
) => {
  const user = await User.findById(decodedToken.userId);

  const isOldPinMatch = await bcryptjs.compare(oldPin, user!.pin as string);
  if (!isOldPinMatch) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Old Pin does not match");
  }

  user!.pin = await bcryptjs.hash(newPin, Number(envVars.BCRYPT_SALT_ROUND));

  user!.save();
};

const getNewAccessToken = async (refreshToken: string) => {
  const newAccessToken = await createNewAccessTokenWithRefreshToken(
    refreshToken
  );

  return {
    accessToken: newAccessToken,
  };
};

export const AuthServices = {
  changePin,
  getNewAccessToken,
};
