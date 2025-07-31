import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { updateWalletZodSchema } from "./wallet.validation";
import { validateRequest } from "../../middlewares/validateRequest";
import { WalletControllers } from "./wallet.controller";
import {
  addMoneyZodSchema,
  cashOutZodSchema,
  sendMoneyZodSchema,
  withdrawZodSchema,
} from "../transaction/transaction.validation";
const router = Router();

router.get("/", checkAuth(Role.ADMIN), WalletControllers.getAllWallet);

router.post(
  "/add-money",
  checkAuth(Role.USER),
  validateRequest(addMoneyZodSchema),
  WalletControllers.addMoney
);
router.post(
  "/send-money",
  checkAuth(Role.USER),
  validateRequest(sendMoneyZodSchema),
  WalletControllers.sendMoney
);

router.post(
  "/withdraw",
  checkAuth(Role.USER),
  validateRequest(withdrawZodSchema),
  WalletControllers.withdraw
);

router.patch(
  "/:id",
  checkAuth(Role.ADMIN),
  validateRequest(updateWalletZodSchema),
  WalletControllers.updateWalletIsBlockStatus
);

export const WalletRoutes = router;
