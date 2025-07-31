import { Router } from "express";
import { UserControllers } from "./user.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { createUserZodSchema, updateUserZodSchema } from "./user.validation";
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

router.patch(
  "/profile-update",
  checkAuth(...Object.values(Role)),
  validateRequest(updateUserZodSchema),
  UserControllers.updateProfile
);

router.get("/get-all-user", checkAuth(Role.ADMIN), UserControllers.getAllUsers);
router.patch(
  "/:id",
  checkAuth(Role.ADMIN),
  validateRequest(updateUserZodSchema),
  UserControllers.updateUser
);

// router.get(
//   "/role/:role",
//   checkAuth(Role.ADMIN),
//   UserControllers.getUsersByRole
// );

export const UserRoutes = router;
