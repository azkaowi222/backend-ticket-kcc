import cron from "node-cron";
import Order from "../models/Order.js";
import Payment from "../models/Payment.js";

cron.schedule("* * * * *", async () => {
  const now = new Date();
  const expiredOrders = await Order.find({
    order_status: "pending",
    expired_at: { $lte: now },
  });

  if (expiredOrders.length === 0) {
    console.log("tidak ada order yang expired");
    return;
  }

  expiredOrders.forEach(async (order) => {
    console.log(`found expired order: ${order.order_id}`);
    const expiredOrder = await Order.findOne({
      order_id: order.order_id,
    });
    const payment = await Payment.findOne({
      order: order._id,
    });
    expiredOrder.order_status = "cancelled";
    payment.payment_status = "expired";
    await expiredOrder.save();
    await payment.save();
    const response = await fetch(
      "https://app.pakasir.com/api/transactioncancel",
      {
        method: "POST",
        body: JSON.stringify({
          project: process.env.PAKASIR_PROJECT,
          order_id: order.order_id,
          amount: order.total,
          api_key: process.env.PAKASIR_API_KEY,
        }),
      },
    );
    const data = await response.json();
    console.log(data);
  });
});
