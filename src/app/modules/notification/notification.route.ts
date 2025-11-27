// modules/notification/notification.route.ts
import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { NotificationController } from "./notification.controller";

const router = Router();

router.get(
  "/my-notifications",
  checkAuth(Role.USER, Role.AGENT),
  NotificationController.getMyNotifications
);

export const NotificationRoutes = router;
