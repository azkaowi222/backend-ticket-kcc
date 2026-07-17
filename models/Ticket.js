import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    ticket_id: {
      type: String,
      unique: true,
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    ticket_type: {
      type: String,
      enum: ["weekday", "weekend"],
      default: "weekday",
    },
    ticket_status: {
      type: String,
      enum: ["active", "used"],
      default: "active",
    },
    used_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Ticket", ticketSchema);
