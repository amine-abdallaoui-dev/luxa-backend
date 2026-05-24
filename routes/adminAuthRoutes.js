const adminAuthController = require("../controllers/auth/adminAuthController");
const { adminaAuthMiddleware } = require("../midlleware/adminAuthMiddleware");
const router = require("express").Router();



router.post("/admin/login",adminAuthController.admin_Login);
router.get("/get-admin",adminaAuthMiddleware,adminAuthController.get_admin);
router.get("/admin/logout", adminaAuthMiddleware, adminAuthController.admin_logout);

module.exports = router;