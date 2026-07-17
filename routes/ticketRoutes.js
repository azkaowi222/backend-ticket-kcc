import express from "express";
import {
  getTicket,
  scanTicket,
  useTicket,
} from "../controllers/ticketController.js";
import { isAdmin, protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/:ticket_id", getTicket);
router.get("/:ticket_id/verify", protect, isAdmin, scanTicket);
router.patch("/:ticket_id", protect, isAdmin, useTicket);

export default router;
