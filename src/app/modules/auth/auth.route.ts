import { Router } from "express";
import { AuthControllers } from "./auth.controller";
import { loginRateLimiter } from "../../middlewares/rateLimiter";
import { Role } from "../user/user.interface";
import { checkAuth } from "../../middlewares/checkAuth";

const router = Router();

router.post("/login", loginRateLimiter, AuthControllers.credentialsLogin);
router.post("/logout", AuthControllers.logout);
router.post(
  "/change-pin",
  checkAuth(...Object.values(Role)),
  AuthControllers.changePin
);
router.post("/refresh-token", AuthControllers.getNewAccessToken);

export const AuthRoutes = router;
