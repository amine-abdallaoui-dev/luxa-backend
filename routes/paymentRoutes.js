const paymentController = require("../controllers/paymentController");
const { sellerAuthMiddleware } = require("../midlleware/sellerAuthMiddleware");
const { adminaAuthMiddleware } = require("../midlleware/adminAuthMiddleware");

const router = require("express").Router();

// Seller routes
router.post(
  "/seller/payment-request",
  sellerAuthMiddleware,
  paymentController.request_payment
);
router.get(
  "/seller/payment-requests",
  sellerAuthMiddleware,
  paymentController.get_payment_requests
);
router.get(
  "/seller/payment-stats",
  sellerAuthMiddleware,
  paymentController.get_payment_stats
);

// Admin routes
router.get(
  "/admin/payment-requests",
  adminaAuthMiddleware,
  paymentController.admin_get_payment_requests
);
router.post(
  "/admin/payment-approve",
  adminaAuthMiddleware,
  paymentController.approve_payment
);
router.post(
  "/admin/payment-reject",
  adminaAuthMiddleware,
  paymentController.reject_payment
);

module.exports = router;
