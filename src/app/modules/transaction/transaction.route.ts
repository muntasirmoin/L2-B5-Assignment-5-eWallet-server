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
  "/my-commission",
  checkAuth(Role.AGENT),
  TransactionController.getMyCommission
);

router.get(
  "/",
  checkAuth(Role.ADMIN),
  TransactionController.getAllTransactions
);

router.post(
  "/reverse/:id",
  checkAuth(Role.ADMIN),
  TransactionController.reverseTransaction
);

router.post(
  "/complete/:id",
  checkAuth(Role.USER),
  TransactionController.completeTransaction
);

router.get(
  "/:id",
  checkAuth(Role.ADMIN),
  TransactionController.singleTransaction
);

export const TransactionRoutes = router;
