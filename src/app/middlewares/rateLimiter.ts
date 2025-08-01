import rateLimit from "express-rate-limit";
import { sendResponse } from "../utils/sendResponse";

export const loginRateLimiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutes
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,

  handler: (req, res) => {
    const retryAfterSeconds = 2 * 60; // 120 seconds = 2 minutes
    const resetTime = Math.floor(Date.now() / 1000) + retryAfterSeconds;

    res.setHeader("Retry-After", retryAfterSeconds.toString());
    res.setHeader("RateLimit-Reset", resetTime.toString());

    sendResponse(res, {
      statusCode: 429,
      success: false,
      message: `Too many login attempts. Please try again in ${
        retryAfterSeconds / 60
      } minutes.`,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: null as any,
    });
  },
});
