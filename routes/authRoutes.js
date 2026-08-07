import express from "express";
import {
  register,
  login,
  logout,
  loginWithGoogle,
  verifyEmail,
  resendOtp
} from "../controllers/authController.js";
import { optionalAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Route POST /api/auth/register
router.post("/register", register);

// Route POST /api/auth/login
router.post("/login", login);
router.post("/login/google", loginWithGoogle);

// POST verify email
router.post("/email/verify", verifyEmail);
router.patch("/email/resend", resendOtp);

router.post("/logout", optionalAuth, logout);

export default router;
