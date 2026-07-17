import express from "express";
import { getProfile, editUser } from "../controllers/userController.js";
import { protect, optionalAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Sisipkan middleware 'protect' di tengah, sebelum fungsi controller
router.get("/profile", optionalAuth, getProfile);
router.patch("/edit", protect, editUser);

export default router;
