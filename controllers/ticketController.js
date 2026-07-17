import Ticket from "../models/Ticket.js";
import { getToday, getVisitDate } from "../utils/today.js";

export const scanTicket = async (req, res) => {
  try {
    const { ticket_id } = req.body;

    if (!ticket_id) {
      return res.status(400).json({
        status: 400,
        message: "ticket_id wajib dikirim",
      });
    }

    const ticket = await Ticket.findOne({ ticket_id }).populate("order");

    if (!ticket) {
      return res.status(200).json({
        status: 404,
        message: "Tiket tidak ditemukan",
      });
    }

    if (ticket.ticket_status === "used") {
      return res.status(400).json({
        status: 400,
        message: "Tiket sudah digunakan",
      });
    }

    const today = getToday();

    const visitDate = getVisitDate(ticket.order.visit_date);

    if (visitDate !== today) {
      return res.status(400).json({
        status: 400,
        message: "Tiket tidak berlaku hari ini",
      });
    }

    ticket.ticket_status = "used";
    ticket.used_at = new Date();

    await ticket.save();

    return res.status(200).json({
      success: true,
      message: "Tiket berhasil diverifikasi",
      data: {
        ticket_id: ticket.ticket_id,
        customer_name: ticket.order.customer_name,
        visit_date: ticket.order.visit_date,
        status: ticket.ticket_status,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

export const getTicket = async (req, res) => {
  try {
    const { ticket_id } = req.params;

    const ticket = await Ticket.findOne({
      ticket_id,
    })
      .populate("order")
      .lean();
    if (!ticket) {
      return res.status(200).json({
        status: 404,
        message: `Ticket ID: ${ticket_id} tidak ditemukan`,
      });
    }

    return res.status(200).json({
      status: 200,
      message: "Ticket berhasil ditemukan",
      data: ticket,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Terjadi kesalahan pada server",
      error: error,
    });
  }
};

export const useTicket = async (req, res) => {
  try {
    const { ticket_id } = req.params;
    const ticket = await Ticket.findOne({
      ticket_id,
    });

    if (!ticket) {
      return res.status(200).json({
        status: 404,
        message: "Tiket tidak ditemukan",
      });
    }

    ticket.used_at = new Date();
    ticket.ticket_status = "used";
    await ticket.save();
    return res.status(200).json({
      status: 200,
      message: "Tiket berhasil digunakan",
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Terjadi kesalahan pada server",
      error: error,
    });
  }
};
