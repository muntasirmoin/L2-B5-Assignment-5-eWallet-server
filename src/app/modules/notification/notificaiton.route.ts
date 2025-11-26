import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Notification } from "./notification.model";
import { JwtPayload } from "jsonwebtoken";

const router = Router();

router.get("/my-notifications", checkAuth(), async (req, res) => {
  const userId = (req.user as JwtPayload).userId;
  const notifications = await Notification.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(50);
  res.json(notifications);
});

export const NotificationRoutes = router;
