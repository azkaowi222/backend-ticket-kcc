import express from "express";
import { register, login, logout } from "../controllers/authController.js";
import { optionalAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Route POST /api/auth/register
router.post("/register", register);

// Route POST /api/auth/login
router.post("/login", login);

router.post("/logout", optionalAuth, logout);

export default router;
