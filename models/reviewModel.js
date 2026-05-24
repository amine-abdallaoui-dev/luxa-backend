const { Schema, model } = require("mongoose");

const reviewSchema = new Schema(
  {
    productId: { type: String, required: true },
    productTitle: { type: String, default: "" },
    customerName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "" },
    status: { type: String, default: "visible" },
  },
  { timestamps: true }
);

module.exports = model("reviews", reviewSchema);
