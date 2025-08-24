import z from "zod";
import { Role } from "./user.interface";

export const createUserZodSchema = z.object({
  name: z
    .string({ invalid_type_error: "Name must be a string" })
    .min(2, { message: "Name must be at least 2 characters long." })
    .max(50, { message: "Name cannot exceed 50 characters." }),

  phone: z
    .string({ invalid_type_error: "Phone must be a string" })
    .regex(/^(01)[3-9]\d{8}$/, {
      message:
        "Phone number must be a valid Bangladeshi number (11 digits, starting with 01 followed by 3-9).",
    }),
  email: z
    .string({ invalid_type_error: "Email must be a string" })
    .email({ message: "Invalid email address format." })
    .optional(),

  pin: z
    .string({ invalid_type_error: "Pin must be a string" })
    .regex(/^\d{4,5}$/, {
      message: "Pin must be 4–5 digits (numbers only).",
    }),

  role: z.enum(Object.values(Role) as [string, ...string[]]).default(Role.USER),

  address: z
    .string({ invalid_type_error: "Address must be a string" })
    .max(100, { message: "Address must not exceed 100 characters." })
    .optional(),

  picture: z
    .string({ invalid_type_error: "Picture must be a URL string" })
    .url({ message: "Picture must be a valid URL." })
    .optional(),

  isAgentApproved: z
    .boolean({ invalid_type_error: "Must be a boolean" })
    .optional(),

  isBlocked: z
    .boolean({ invalid_type_error: "Must be a boolean" })
    .default(false),

  commissionRate: z
    .number({ invalid_type_error: "Commission rate must be a number" })
    .nonnegative({ message: "Commission rate cannot be negative." })
    .optional(),

  permissionLevel: z
    .number({ invalid_type_error: "Permission level must be a number" })
    .int({ message: "Permission level must be an integer." })
    .optional(),
});

export const changeUserPinZodSchema = z.object({
  oldPin: z
    .string({ invalid_type_error: "Pin must be a string" })
    .regex(/^\d{4,5}$/, {
      message: "Pin must be 4–5 digits (numbers only).",
    }),
  newPin: z
    .string({ invalid_type_error: "Pin must be a string" })
    .regex(/^\d{4,5}$/, {
      message: "Pin must be 4–5 digits (numbers only).",
    }),
});

export const updateUserZodSchema = z.object({
  name: z
    .string({ invalid_type_error: "Name must be a string" })
    .min(2, { message: "Name must be at least 2 characters long." })
    .max(50, { message: "Name cannot exceed 50 characters." })
    .optional(),
  phone: z
    .string({ invalid_type_error: "Phone must be a string" })
    .regex(/^(01)[3-9]\d{8}$/, {
      message:
        "Phone number must be a valid Bangladeshi number (11 digits, starting with 01 followed by 3-9).",
    })
    .optional(),
  email: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z
      .string({ invalid_type_error: "Email must be a string" })
      .email({ message: "Invalid email address format." })
      .optional()
  ),

  role: z.enum(Object.values(Role) as [string, ...string[]]).optional(),
  address: z
    .string({ invalid_type_error: "Address must be a string" })
    .max(100, { message: "Address must not exceed 100 characters." })
    .optional(),

  picture: z
    .string({ invalid_type_error: "Picture must be a URL string" })
    .url({ message: "Picture must be a valid URL." })
    .optional(),

  isAgentApproved: z
    .boolean({ invalid_type_error: "Must be a boolean" })
    .optional(),

  isBlocked: z.boolean({ invalid_type_error: "Must be a boolean" }).optional(),

  commissionRate: z
    .number({ invalid_type_error: "Commission rate must be a number" })
    .nonnegative({ message: "Commission rate cannot be negative." })
    .optional(),

  permissionLevel: z
    .number({ invalid_type_error: "Permission level must be a number" })
    .int({ message: "Permission level must be an integer." })
    .optional(),
});

export const changeAgentApprovalStatusZodSchema = z.object({
  isAgentApproved: z.boolean({
    invalid_type_error: "isAgentApproved Must be a boolean",
  }),
});
