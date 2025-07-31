import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../config/env";

import { User } from "../modules/user/user.model";
import { verifyToken } from "../utils/jwt";
import AppError from "../helpers/AppError";

export const checkAuth =
  (...authRoles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accessToken = req.headers.authorization;

      if (!accessToken) {
        throw new AppError(403, "Token Not Received");
      }

      const verifiedToken = verifyToken(
        accessToken,
        envVars.JWT_ACCESS_SECRET
      ) as JwtPayload;

      const isUserExist = await User.findOne({ phone: verifiedToken.phone });

      if (!isUserExist) {
        throw new AppError(httpStatus.BAD_REQUEST, "Account does not exist");
      }
      if (isUserExist.isBlocked === true) {
        throw new AppError(httpStatus.BAD_REQUEST, `Account is Blocked`);
      }

      if (isUserExist.isDeleted) {
        throw new AppError(httpStatus.BAD_REQUEST, "Account is deleted");
      }

      if (!authRoles.includes(verifiedToken.role)) {
        throw new AppError(403, "You are not permitted to view this route!!!");
      }
      req.user = verifiedToken;
      next();
    } catch (error) {
      console.log("jwt error", error);
      next(error);
    }
  };
