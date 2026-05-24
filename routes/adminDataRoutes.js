const adminDataController = require("../controllers/adminDashboard/adminDataController");
const { adminaAuthMiddleware } = require("../midlleware/adminAuthMiddleware");

const router = require("express").Router();

router.post("/add-brand",adminaAuthMiddleware,adminDataController.addBrand)
router.get("/brands-get", adminaAuthMiddleware, adminDataController.get_brands);
router.get("/reviews-get", adminaAuthMiddleware, adminDataController.get_reviews);
router.get(
  "/customers-get",
  adminaAuthMiddleware,
  adminDataController.get_customers
);
router.get(
  "/transactions-get",
  adminaAuthMiddleware,
  adminDataController.get_transactions
);
router.get("/sellers-get", adminaAuthMiddleware, adminDataController.get_sellers);
router.get(
  "/dashboard-stats",
  adminaAuthMiddleware,
  adminDataController.get_dashboard_stats
);

router.post("/seller-add", adminaAuthMiddleware, adminDataController.add_seller);
router.put("/seller-edit/:id", adminaAuthMiddleware, adminDataController.edit_seller);
router.delete("/seller-delete/:id", adminaAuthMiddleware, adminDataController.delete_seller);

module.exports = router;
