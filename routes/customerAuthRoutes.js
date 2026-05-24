const router = require("express").Router();
const customerAuthController = require("../controllers/auth/customerAuthController");
const { customerAuthMiddleware } = require("../midlleware/customerAuthMiddleware");

router.post("/customer/register", customerAuthController.register);
router.post("/customer/login", customerAuthController.login);
router.get("/get-customer", customerAuthMiddleware, customerAuthController.get_customer);
router.post("/customer/logout", customerAuthMiddleware, customerAuthController.logout);
router.put("/customer/profile", customerAuthMiddleware, customerAuthController.update_profile);

module.exports = router;
