const { Schema, model } = require("mongoose");

const brandSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true },
    image: { type: String, default: "" },
    status: { type: String, default: "active" },
  },
  { timestamps: true }
);

module.exports = model("brands", brandSchema);
