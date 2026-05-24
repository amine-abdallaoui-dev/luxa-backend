const router = require("express").Router();
const wishlistController = require("../controllers/wishlistController");
const { customerAuthMiddleware } = require("../midlleware/customerAuthMiddleware");

router.post("/home/wishlist/add", customerAuthMiddleware, wishlistController.add_to_wishlist);
router.get("/home/wishlist/get", customerAuthMiddleware, wishlistController.get_wishlist);
router.delete("/home/wishlist/remove/:wishlistId", customerAuthMiddleware, wishlistController.remove_wishlist);

module.exports = router;
