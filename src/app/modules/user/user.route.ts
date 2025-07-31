import { Router } from "express";
import { UserControllers } from "./user.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { createUserZodSchema } from "./user.validation";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "./user.interface";

const router = Router();

router.post(
  "/register",
  validateRequest(createUserZodSchema),
  UserControllers.createUser
);

router.get("/me", checkAuth(...Object.values(Role)), UserControllers.getMe);

router.patch(
  "/approval-agent/:id",
  checkAuth(Role.ADMIN),
  UserControllers.changeAgentApprovalStatus
);

router.get(
  "/role/:role",
  checkAuth(Role.ADMIN),
  UserControllers.getUsersByRole
);

export const UserRoutes = router;
