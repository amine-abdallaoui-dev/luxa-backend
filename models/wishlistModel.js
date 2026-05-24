const { Schema, model } = require("mongoose");

const wishlistSchema = new Schema(
  {
    userId: {
      type: Schema.ObjectId,
      required: true,
      ref: "customers",
    },
    productId: {
      type: Schema.ObjectId,
      required: true,
      ref: "products",
    },
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    discount: {
      type: Number,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
    }
  },
  { timestamps: true }
);

module.exports = model("wishlists", wishlistSchema);
