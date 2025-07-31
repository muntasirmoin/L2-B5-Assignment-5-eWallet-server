/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction } from "express";

import { Request, Response } from "express";

type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

export const catchAsync =
  (fn: AsyncHandler) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((err: any) => {
      // console.log(err);
      next(err);
    });
  };
