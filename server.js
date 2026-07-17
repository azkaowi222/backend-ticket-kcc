import express from "express";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import webhookRoutes from "./routes/webhookRoutes.js";
import ticketRoutes from "./routes/ticketRoutes.js";
import cors from "cors";
import "dotenv/config";
import "./jobs/cancelExpiredOrders.js";

const app = express();

app.use(express.json());
const allowedOrigins = ["https://domain-production-anda.com"];

const corsOptions = {
  origin: (origin, callback) => {
    // Mengizinkan Postman, aplikasi mobile, atau request tanpa Origin
    if (!origin) {
      return callback(null, true);
    }

    const isLocalhost = /^http:\/\/localhost:\d+$/.test(origin);
    const isAllowedProduction = allowedOrigins.includes(origin);

    if (isLocalhost || isAllowedProduction) {
      return callback(null, true);
    }

    return callback(new Error(`Origin ${origin} tidak diizinkan oleh CORS`));
  },

  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

  allowedHeaders: ["Content-Type", "Authorization"],

  credentials: true,
};
app.use(cors(corsOptions));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/webhook", webhookRoutes);
app.use("/api/tickets", ticketRoutes);

// app.delete("/delete", async (req, res) => {
//   try {
//     // await Payment.collection.dropIndex("order_id_1");
//     await Promise.all([
//       Order.deleteMany({}),
//       Payment.deleteMany({}),
//       Ticket.deleteMany({}),
//       User.deleteMany({}),
//     ]);

//     return res.status(200).json({
//       success: true,
//       message: "Database berhasil dibersihkan.",
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Gagal membersihkan database.",
//       error: error.message,
//     });
//   }
// });

// app.get("/orders", async (req, res) => {
//   const orders = await Payment.find().populate("order").lean();
//   return res.status(200).json({
//     status: 200,
//     data: orders,
//   });
// });

app.get("/healtcheck", async (req, res) => {
  return res.status(200).send("OK");
});

mongoose
  .connect(process.env.MONGO_URI, {
    dbName: "Mannxstore-ticket",
  })
  .then(() => console.log("✅ Terhubung ke MongoDB"))
  .catch((err) => console.error("❌ Gagal terhubung ke MongoDB:", err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});
