const sellerAuthController = require("../controllers/auth/sellerAuthController")
const { adminaAuthMiddleware } = require("../midlleware/adminAuthMiddleware")
const { sellerAuthMiddleware } = require("../midlleware/sellerAuthMiddleware")


const router = require("express").Router()



router.post("/seller/register",sellerAuthController.sellerRegister)
router.post("/seller/login",sellerAuthController.sellerLogin)
router.get("/getSellerInfo",sellerAuthMiddleware,sellerAuthController.getSellerData)


module.exports = router