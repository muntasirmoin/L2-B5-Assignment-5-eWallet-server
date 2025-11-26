import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Notification } from "./notification.model";
import { JwtPayload } from "jsonwebtoken";
import { Role } from "../user/user.interface";

const router = Router();

router.get(
  "/my-notifications",
  checkAuth(Role.USER, Role.AGENT),
  async (req, res) => {
    const userId = (req.user as JwtPayload).userId;
    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  }
);

router.patch(
  "/seen/:id",
  checkAuth(Role.USER, Role.AGENT),
  async (req, res) => {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { seen: true },
      { new: true }
    );
    res.json(notification);
  }
);

export const NotificationRoutes = router;
