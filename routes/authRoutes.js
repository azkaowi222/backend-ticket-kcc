import express from "express";
import {
  register,
  login,
  logout,
  loginWithGoogle,
  verifyEmail,
  resendOtp,
  updatePassword,
} from "../controllers/authController.js";
import { optionalAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Route POST /api/auth/register
router.post("/register", register);

// Route POST /api/auth/login
router.post("/login", login);
router.post("/login/google", loginWithGoogle);

// POST, PATCH verify email
router.post("/email/verify", verifyEmail);
router.patch("/email/resend", resendOtp);

//PATCH reset-password
router.patch("/update-password", updatePassword);

router.post("/logout", optionalAuth, logout);

export default router;
