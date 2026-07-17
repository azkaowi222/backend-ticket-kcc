import express from "express";
import Order from "../models/Order.js";
import Payment from "../models/Payment.js";
import { genTicketCode } from "../utils/generateCode.js";
import Ticket from "../models/Ticket.js";
import isWeekDay from "../utils/dayType.js";
import mongoose from "mongoose";

const router = express.Router();

router.post("/callback", async (req, res) => {
  //     {
  //   amount: 80000,
  //   completed_at: '2026-07-09T10:05:46.892210977Z',
  //   is_sandbox: true,
  //   order_id: 'ORD-20260709-196829',
  //   payment_method: 'qris',
  //   project: 'mannx-sandbox',
  //   status: 'completed'
  const session = await mongoose.startSession();
  session.startTransaction();
  // }
  try {
    const { order_id, status, amount } = req.body;
    const order = await Order.findOne({
      order_id,
    });
    if (!order || order.length === 0 || order === null) {
      return res.status(400).json({
        status: 400,
        message: "Order tidak ditemukan",
      });
    }

    if (order.total - order.fee !== amount) {
      return res.status(400).json({
        status: 400,
        message: "Nominal pembayaran tidak sesuai",
      });
    }
    if (status !== "completed") {
      return res.status(200).json({
        success: true,
        message: "Pembayaran belum completed",
      });
    }
    const payment = await Payment.findOne({
      order: order._id,
    });
    order.order_status = "success";
    payment.payment_status = "paid";
    const tickets = [];
    for (let i = 0; i < order.quantity; i++) {
      const ticketId = genTicketCode();

      tickets.push({
        order: order._id,
        ticket_id: ticketId,
        ticket_type: isWeekDay ? "weekday" : "weekend",
        ticket_status: "active",
        visit_date: order.visit_date,
      });
    }
    await Ticket.insertMany(tickets);
    await order.save();
    await payment.save();
    return res.status(200).json({
      status: 200,
      message: "Pembelian berhasil",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({
      status: 500,
      message: "Terjadi kesalahan pada server",
      error: error.message,
      stack: error.stack,
    });
  }
});

export default router;
