const { Schema, model } = require("mongoose");

const orderSchema = new Schema(
  {
    orderId: { type: String, required: true, unique: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerId: { type: String, default: "" },
    shippingAddress: { type: String, default: "" },
    shippingCity: { type: String, default: "" },
    shippingPhone: { type: String, default: "" },
    products: [
      {
        productId: String,
        title: String,
        qty: Number,
        price: Number,
      },
    ],
    totalPrice: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    deliveryStatus: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    sellerId: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = model("orders", orderSchema);
