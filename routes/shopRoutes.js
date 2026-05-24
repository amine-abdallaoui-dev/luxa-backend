const router = require("express").Router();
const publicController = require("../controllers/shop/publicController");

router.get("/public/categories", publicController.get_categories);
router.get("/public/products", publicController.get_products);
router.get("/public/home-products", publicController.get_home_products);
router.get("/public/products/:id", publicController.get_product);
router.get("/public/reviews/:productId", publicController.get_product_reviews);
router.post("/public/reviews", publicController.submit_review);

module.exports = router;
