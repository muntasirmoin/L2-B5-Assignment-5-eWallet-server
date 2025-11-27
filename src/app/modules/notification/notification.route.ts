import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { NotificationController } from "./notification.controller";

const router = Router();

router.get("/test", (req, res) => {
  res.json({ message: "Notification module is mounted!" });
});

router.get(
  "/my-notifications",
  checkAuth(Role.USER, Role.AGENT),
  NotificationController.getMyNotifications
);

router.patch(
  "/seen/:id",
  checkAuth(Role.USER, Role.AGENT),
  NotificationController.markNotificationSeen
);

router.patch(
  "/seen-all",
  checkAuth(Role.USER, Role.AGENT),
  NotificationController.markAllNotificationsSeen
);

export const NotificationRoutes = router;
