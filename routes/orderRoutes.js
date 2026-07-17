import express from "express";
import { optionalAuth, protect } from "../middlewares/authMiddleware.js";
import {
  createOrder,
  orderHistory,
  orderHistoryDetails,
} from "../controllers/orderController.js";

const router = express.Router();

router.post("/create", optionalAuth, createOrder);
router.get("/", optionalAuth, orderHistory);
router.get("/:order_id/:customer_name", optionalAuth, orderHistory);
router.get("/:order_id", optionalAuth, orderHistoryDetails);

export default router;
