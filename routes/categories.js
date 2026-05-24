const Categories = require("../controllers/adminDashboard/Categories")
const { adminaAuthMiddleware } = require("../midlleware/adminAuthMiddleware");
const adminDataController = require("../controllers/adminDashboard/adminDataController");
const router = require("express").Router()



router.post("/category-add",adminaAuthMiddleware,Categories.addCategory)
router.get("/category-get",adminaAuthMiddleware,Categories.get_categories)
router.post("/category-delete",adminaAuthMiddleware,Categories.deleteCategory)

router.get("/get-brand",adminaAuthMiddleware,adminDataController.getAllBrands)

module.exports = router
