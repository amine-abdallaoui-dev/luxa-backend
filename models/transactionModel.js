const { Schema, model } = require("mongoose");

const transactionSchema = new Schema(
  {
    transactionId: { type: String, required: true, unique: true },
    orderId: { type: String, required: true },
    customerName: { type: String, default: "" },
    amount: { type: Number, required: true },
    method: { type: String, default: "card" },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "completed",
    },
  },
  { timestamps: true }
);

module.exports = model("transactions", transactionSchema);
