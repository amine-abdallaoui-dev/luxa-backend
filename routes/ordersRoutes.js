const ordersController = require("../controllers/adminDashboard/ordersController");
const { adminaAuthMiddleware } = require("../midlleware/adminAuthMiddleware");
const { sellerAuthMiddleware } = require("../midlleware/sellerAuthMiddleware");
const { customerAuthMiddleware } = require("../midlleware/customerAuthMiddleware");

const router = require("express").Router();

router.get("/orders-get", adminaAuthMiddleware, ordersController.get_orders);
router.get(
  "/seller/orders-get",
  sellerAuthMiddleware,
  ordersController.get_orders
);
router.post(
  "/order-status",
  adminaAuthMiddleware,
  ordersController.update_order_status
);

// Customer: get own orders by customerId
router.get("/orders/my-orders", customerAuthMiddleware, ordersController.get_customer_orders);

module.exports = router;

