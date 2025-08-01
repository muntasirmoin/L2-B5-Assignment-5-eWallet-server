import { z } from "zod";
import { Types } from "mongoose";
import {
  TransactionSourceEnum,
  TransactionStatusEnum,
  TransactionTypeEnum,
} from "./transaction.interface";
import { isValidObjectId } from "mongoose";

export const createTransactionZodSchema = z.object({
  type: z.enum(Object.values(TransactionTypeEnum) as [string, ...string[]], {
    invalid_type_error: "Transaction type must be a valid string",
  }),

  amount: z
    .number({ invalid_type_error: "Amount must be a number" })
    .positive({ message: "Amount must be greater than zero" }),

  status: z
    .enum(Object.values(TransactionStatusEnum) as [string, ...string[]], {
      invalid_type_error: "Transaction status must be a valid string",
    })
    .default(TransactionStatusEnum.Completed),

  source: z
    .enum(Object.values(TransactionSourceEnum) as [string, ...string[]], {
      invalid_type_error: `Transaction source must be a valid string["card" or "bank"]`,
    })
    .optional(),

  sender: z
    .string({ invalid_type_error: "Sender ID must be a string" })
    .optional(),

  receiver: z
    .string({ invalid_type_error: "Receiver ID must be a string" })
    .optional(),

  reversalOf: z
    .string({ invalid_type_error: "reversalOf ID must be a string" })
    .optional(),

  createdBy: z.string({ invalid_type_error: "CreatedBy must be a string" }),

  fee: z
    .number({ invalid_type_error: "Fee must be a number" })
    .nonnegative({ message: "Fee cannot be negative" })
    .optional(),

  commission: z
    .number({ invalid_type_error: "Commission must be a number" })
    .nonnegative({ message: "Commission cannot be negative" })
    .optional(),
});

export const addMoneyZodSchema = z.object({
  amount: z
    .number({ invalid_type_error: "Amount must be a number" })
    .positive({ message: "Amount must be greater than zero" }),
  source: z.enum(
    Object.values(TransactionSourceEnum) as [string, ...string[]],
    {
      invalid_type_error: `Transaction source must be a valid string["card" or "bank"]`,
    }
  ),
});

export const sendMoneyZodSchema = z.object({
  // receiver: z.string({ invalid_type_error: "Receiver ID must be a string." }),
  receiver: z
    .string({ invalid_type_error: "Receiver ID must be a string." })
    .refine((val) => isValidObjectId(val), {
      message: "Receiver must be a valid ObjectId.",
    }),

  amount: z
    .number({ invalid_type_error: "Amount must be a number." })
    .positive({ message: "Amount must be greater than zero." }),
});

export const cashInZodSchema = z.object({
  // receiver: z.string({ invalid_type_error: "Receiver ID must be a string." }),
  userId: z
    .string({ invalid_type_error: "User ID must be a string." })
    .refine((val) => isValidObjectId(val), {
      message: "Receiver must be a valid ObjectId.",
    }),

  amount: z
    .number({ invalid_type_error: "Amount must be a number." })
    .positive({ message: "Amount must be greater than zero." }),
});

export const cashOutZodSchema = z.object({
  // receiver: z.string({ invalid_type_error: "Receiver ID must be a string." }),
  userId: z
    .string({ invalid_type_error: "Receiver ID must be a string." })
    .refine((val) => isValidObjectId(val), {
      message: "Receiver must be a valid ObjectId.",
    }),

  amount: z
    .number({ invalid_type_error: "Amount must be a number." })
    .positive({ message: "Amount must be greater than zero." }),
});

export const withdrawZodSchema = z.object({
  amount: z
    .number({ invalid_type_error: "Amount must be a number" })
    .positive({ message: "Amount must be greater than zero" }),
  source: z.enum(
    Object.values(TransactionSourceEnum) as [string, ...string[]],
    {
      invalid_type_error: `Transaction source must be a valid string["card" or "bank" or "bkash"]`,
    }
  ),
});
