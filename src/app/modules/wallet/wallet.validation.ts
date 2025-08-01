import z from "zod";
import { WalletStatus } from "./wallet.interface";

export const createWalletZodSchema = z.object({
  user: z
    .string({ invalid_type_error: "User ID must be a string." })
    .min(1, { message: "User ID is required." }),

  balance: z
    .number({ invalid_type_error: "Balance must be a number." })
    .min(0, { message: "Balance cannot be negative." })
    .optional(),

  isBlocked: z
    .enum([WalletStatus.BLOCKED, WalletStatus.UNBLOCKED], {
      required_error: "isBlocked is required.",
    })
    .optional(),

  currency: z
    .string({ invalid_type_error: "Currency must be a string." })
    .default("BDT")
    .optional(),
});

export const updateWalletZodSchema = z.object({
  balance: z
    .number({ invalid_type_error: "Balance must be a number." })
    .min(0, { message: "Balance cannot be negative." })
    .optional(),

  isBlocked: z
    .enum([WalletStatus.BLOCKED, WalletStatus.UNBLOCKED], {
      invalid_type_error: "isBlocked must be either 'blocked' or 'unblocked'.",
    })
    .optional(),

  currency: z
    .string({ invalid_type_error: "Currency must be a string." })
    .optional(),
});

export const updateWalletIsBlockStatusZodSchema = z.object({
  isBlocked: z.enum([WalletStatus.BLOCKED, WalletStatus.UNBLOCKED], {
    required_error: "isBlocked is required.",
    invalid_type_error: "isBlocked must be either 'blocked' or 'unblocked'.",
  }),
});
