import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import passport from "passport";
import { JwtPayload } from "jsonwebtoken";
import AppError from "../../helpers/AppError";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { createUserTokens } from "../../utils/userTokens";
import { setAuthCookie } from "../../utils/setCookie";
import { AuthServices } from "./auth.service";
import { envVars } from "../../config/env";

const credentialsLogin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    passport.authenticate("local", async (err: any, user: any, info: any) => {
      console.log("user:", user);
      if (err) {
        return next(new AppError(401, err));
      }

      if (!user) {
        return next(new AppError(401, info.message));
      }

      const userTokens = await createUserTokens(user);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { pin: pass, ...rest } = user.toObject();

      setAuthCookie(res, userTokens);

      const timestamp = new Date().toLocaleString();
      console.log(
        `[Notification] Account Logged In Successfully at ${timestamp}.`
      );

      sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Account Logged In Successfully",
        data: {
          accessToken: userTokens.accessToken,
          refreshToken: userTokens.refreshToken,
          user: rest,
        },
      });
    })(req, res, next);
  }
);

const logout = catchAsync(async (req: Request, res: Response) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    // secure: false,
    // sameSite: "lax",
    secure: envVars.NODE_ENV === "production",
    sameSite: "none",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    // secure: false,
    // sameSite: "lax",
    secure: envVars.NODE_ENV === "production",
    sameSite: "none",
  });

  const timestamp = new Date().toLocaleString();
  console.log(`[Notification] User logged out at ${timestamp}!`);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User Logged Out Successfully",
    data: null,
  });
});

const changePin = catchAsync(async (req: Request, res: Response) => {
  const newPin = req.body.newPin;
  const oldPin = req.body.oldPin;
  const decodedToken = req.user;

  await AuthServices.changePin(oldPin, newPin, decodedToken as JwtPayload);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Pin Changed Successfully",
    data: null,
  });
});

const getNewAccessToken = catchAsync(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "No refresh token received from cookies"
    );
  }
  const tokenInfo = await AuthServices.getNewAccessToken(
    refreshToken as string
  );

  setAuthCookie(res, tokenInfo);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Refresh Token Retrieved Successfully",
    data: tokenInfo,
  });
});

export const AuthControllers = {
  credentialsLogin,
  logout,
  changePin,
  getNewAccessToken,
};
