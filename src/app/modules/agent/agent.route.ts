import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { validateRequest } from "../../middlewares/validateRequest";
import { AgentControllers } from "./agent.controller";
import {
  cashInZodSchema,
  cashOutZodSchema,
} from "../transaction/transaction.validation";

const router = Router();

router.get(
  "/get-all-agent",
  checkAuth(Role.ADMIN),
  AgentControllers.getAllAgents
);

router.post(
  "/cash-in",
  checkAuth(Role.AGENT),
  validateRequest(cashInZodSchema),
  AgentControllers.cashIn
);

router.post(
  "/cash-out",
  checkAuth(Role.AGENT),
  validateRequest(cashOutZodSchema),
  AgentControllers.cashOut
);

export const AgentRoutes = router;
