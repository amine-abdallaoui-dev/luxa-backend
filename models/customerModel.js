const { Schema, model } = require("mongoose");

const customerSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    city: { type: String, default: "" },
    country: { type: String, default: "" },
    status: { type: String, default: "active" },
    ordersCount: { type: Number, default: 0 },
    image: { type: String, default: "" },
    role: { type: String, default: "customer" },
  },
  { timestamps: true }
);

module.exports = model("customers", customerSchema);
