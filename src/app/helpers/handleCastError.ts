/* eslint-disable @typescript-eslint/no-unused-vars */
import mongoose from "mongoose";
import { TGenericErrorResponse } from "../interfaces/error.types";

export const handleCastError = (
  err: mongoose.Error.CastError
): TGenericErrorResponse => {
  let message = "";

  if (err.path === "_id") {
    message = "Invalid MongoDB ObjectID. Please provide a valid id";
  } else {
    message = `Invalid value '${err.value}' for field '${err.path}'. Expected type: ${err.kind}`;
  }

  return {
    statusCode: 400,
    message,
    // message: "Invalid MongoDB ObjectID. Please provide a valid id",
  };
};
