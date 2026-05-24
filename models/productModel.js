const { Schema, model } = require("mongoose");

const productSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true },
    brand: { type: String, required: true },
    category: { type: String, required: true },
    stock: { type: Number, required: true },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    description: { type: String, required: true },
    images: { type: Array, required: true },
    rating: { type: Number, default: 4 },
    status: { type: String, default: "active" },
    sellerId: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = model("products", productSchema);
