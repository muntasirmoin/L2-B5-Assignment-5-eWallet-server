import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";

import cors from "cors";
import { router } from "./app/routes";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";
import notFound from "./app/middlewares/notFound";

import passport from "passport";

import "./app/config/passport";

const app = express();

app.use(passport.initialize());

app.use(cookieParser());
app.use(express.json());

// app.use(cors());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// routes -> index.ts
app.use("/api/v1", router);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message:
      "eWallet is running successfully. Welcome to the eWallet Digital Wallet Management Server!",
  });
});

app.use(globalErrorHandler);

app.use(notFound);

export default app;
