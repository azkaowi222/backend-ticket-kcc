import mongoose from "mongoose";
import Order from "../models/Order.js";
import { genOrderCode, genPaymentCode } from "../utils/generateCode.js";
import Payment from "../models/Payment.js";
import isWeekday from "../utils/dayType.js";
import { getToday, getVisitDate } from "../utils/today.js";
import Ticket from "../models/Ticket.js";

export const createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { visitDate, quantity, customerName, customerPhone } = req.body;
    console.log(`visitdate: ${visitDate}`);
    if (!visitDate || !quantity || !customerName) {
      return res.status(400).json({
        status: 400,
        message: "Semua field wajib diisi",
      });
    }
    if (quantity < 1) {
      return res.status(400).json({
        status: 400,
        message: "Minimal pembelian 1 ticket",
      });
    }
    const today = getToday();
    const visitDateValue = getVisitDate(visitDate);

    if (visitDateValue < today) {
      return res.status(400).json({
        status: 400,
        message: "Tanggal kunjungan minimal hari ini.",
      });
    }
    const orderId = genOrderCode();
    const isWeekDay = isWeekday(new Date(visitDateValue));
    const price = parseInt(
      isWeekDay ? process.env.PRICE_WEEKDAY : process.env.PRICE_WEEKEND,
    );
    const expiredAt = new Date(Date.now() + 2 * 60 * 1000);
    const total = price * quantity;
    const response = await fetch(
      "https://app.pakasir.com/api/transactioncreate/qris",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          project: process.env.PAKASIR_PROJECT,
          order_id: orderId,
          amount: total,
          api_key: process.env.PAKASIR_API_KEY,
        }),
      },
    );

    const data = await response.json();
    const order = await Order.create({
      user: req.user?.id ?? null,
      order_id: orderId,
      customer_name: customerName,
      customer_phone: customerPhone,
      quantity,
      price,
      total: total + data.payment.fee,
      fee: data.payment.fee,
      visit_date: visitDateValue,
      order_status: "pending",
      expired_at: expiredAt,
    });
    const paymentId = genPaymentCode();
    const payment = await Payment.create({
      payment_id: paymentId,
      order: order._id,
      payment_status: "pending",
      payment_method: "qris",
    });

    return res.status(201).json({
      status: 201,
      message: "Order berhasil dibuat",
      data: {
        order_id: orderId,
        visitDate,
        quantity,
        price,
        total,
        payment_status: "pending",
        pakasir: data,
      },
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
};

export const orderHistory = async (req, res) => {
  try {
    const { order_id, customer_name } = req.params;

    let orders;
    if (req.user?.id) {
      orders = await Order.find({
        user: req.user.id,
      });
    } else {
      orders = await Order.find({
        order_id,
        customer_name,
      });
    }

    if (!orders) {
      return res.status(200).json({
        status: 404,
        message: "Order tidak ditemukan",
        // data: order,
      });
    }
    return res.status(200).json({
      status: 200,
      data: orders,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Terjadi kesalahan pada server",
      error: error.message,
      stack: error.stack,
    });
  }
};

export const orderHistoryDetails = async (req, res) => {
  try {
    const { order_id } = req.params;
    const order = await Order.findOne({
      order_id,
    }).lean();

    if (!order) {
      return res.status(200).json({
        status: 404,
        message: "Order tidak ditemukan",
      });
    }

    const tickets = await Ticket.find({
      order: order._id,
    });

    return res.status(200).json({
      status: 200,
      message: "Order berhasil ditemukan",
      data: {
        ...order,
        tickets,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Terjadi kesalahan pada server",
      error: error.message,
      stack: error.stack,
    });
  }
};
