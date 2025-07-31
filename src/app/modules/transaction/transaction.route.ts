import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { TransactionController } from "./transaction.controller";

const router = Router();

router.get(
  "/my-transactions",
  checkAuth(Role.USER, Role.AGENT),
  TransactionController.getMyTransactions
);

router.get(
  "/",
  checkAuth(Role.ADMIN),
  TransactionController.getAllTransactions
);

export const TransactionRoutes = router;
