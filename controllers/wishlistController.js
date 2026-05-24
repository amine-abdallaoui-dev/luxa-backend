const wishlistModel = require("../models/wishlistModel");

class wishlistController {
  add_to_wishlist = async (req, res) => {
    try {
      const { id } = req; // From authMiddleware
      const { productId, title, price, image, discount, slug, rating } = req.body;

      if (!id) {
        return res.status(401).json({ error: "Please login first" });
      }

      const isExist = await wishlistModel.findOne({ userId: id, productId });
      if (isExist) {
        return res.status(400).json({ error: "Product is already in wishlist" });
      }

      const wishlistItem = await wishlistModel.create({
        userId: id,
        productId,
        title,
        price,
        image,
        discount,
        slug,
        rating
      });

      return res.status(201).json({
        message: "Added to wishlist",
        wishlistItem,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  };

  get_wishlist = async (req, res) => {
    const { id } = req;
    try {
      if (!id) {
        return res.status(401).json({ error: "Please login first" });
      }
      const wishlists = await wishlistModel.find({ userId: id }).sort({ createdAt: -1 });
      return res.status(200).json({ wishlists });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  };

  remove_wishlist = async (req, res) => {
    const { wishlistId } = req.params;
    try {
      await wishlistModel.findByIdAndDelete(wishlistId);
      return res.status(200).json({
        message: "Removed from wishlist",
        wishlistId,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  };
}

module.exports = new wishlistController();
