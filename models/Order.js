import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    order_id: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    customer_name: {
      type: String,
      required: true,
    },
    customer_phone: {
      type: String,
      default: null,
    },
    quantity: {
      type: Number,
      required: true,
    },
    visit_date: {
      type: Date,
      required: true,
    },
    price: {
      type: Number,
      enum: [40000, 50000],
      default: 40000,
    },
    fee: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
    },
    order_status: {
      type: String,
      enum: ["pending", "success", "cancelled"],
      default: "pending",
    },
    expired_at: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Order", orderSchema);
