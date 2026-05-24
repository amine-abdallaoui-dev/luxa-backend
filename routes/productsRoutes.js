const productsController = require("../controllers/adminDashboard/productsController");
const { adminaAuthMiddleware } = require("../midlleware/adminAuthMiddleware");
const { sellerAuthMiddleware } = require("../midlleware/sellerAuthMiddleware");

const router = require("express").Router();

router.post("/add-product", adminaAuthMiddleware, productsController.add_product);
router.post(
  "/seller/add-product",
  sellerAuthMiddleware,
  productsController.add_product
);
router.get("/products-get", adminaAuthMiddleware, productsController.get_products);
router.get(
  "/seller/products-get",
  sellerAuthMiddleware,
  productsController.get_products
);
router.get("/product-get/:id", productsController.get_product);
router.post(
  "/product-delete",
  adminaAuthMiddleware,
  productsController.delete_product
);
router.post(
  "/seller/product-delete",
  sellerAuthMiddleware,
  productsController.delete_product
);
router.post(
  "/product-status",
  adminaAuthMiddleware,
  productsController.update_product_status
);
router.post(
  "/product-update",
  adminaAuthMiddleware,
  productsController.update_product
);

module.exports = router;
