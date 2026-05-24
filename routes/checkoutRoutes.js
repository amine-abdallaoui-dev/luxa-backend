const router = require("express").Router();
const checkoutController = require("../controllers/checkout/checkoutController");
const fs = require("fs");
const path = require("path");
const { customerAuthMiddleware } = require("../midlleware/customerAuthMiddleware");

router.post(
  "/checkout/create-payment-intent",
  customerAuthMiddleware,
  checkoutController.create_payment_intent
);
router.post(
  "/checkout/confirm-order",
  customerAuthMiddleware,
  checkoutController.confirm_order
);
router.get("/checkout/config", (req, res) => {
  let pk = process.env.STRIPE_PUBLISHABLE_KEY || "";
  
  if (!pk) {
    try {
      const envPath = path.resolve(__dirname, "../.env");
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, "utf8");
        const match = envContent.match(/STRIPE_PUBLISHABLE_KEY\s*=\s*(.*)/);
        if (match) pk = match[1];
      }
    } catch(e) {
      console.error("Error reading .env for Stripe Key", e);
    }
  }

  res.json({
    publishableKey: pk.trim(),
  });
});

module.exports = router;
