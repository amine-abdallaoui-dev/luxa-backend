const CategoryModel = require("../../models/CategoryModel");
const ProductModel = require("../../models/productModel");
const ReviewModel = require("../../models/reviewModel");
const { responseReturn } = require("../../utils/responseReturn");
const { buildListQuery, textSearchFilter } = require("../../utils/queryHelper");

class publicController {
  get_categories = async (req, res) => {
    try {
      const categories = await CategoryModel.find({}).sort({ createdAt: -1 });
      responseReturn(res, 200, { categories });
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };

  get_products = async (req, res) => {
    try {
      const { page, perPage, skip, search, category } = buildListQuery(req.query);
      const sort = req.query.sort || "latest";

      const filter = {
        status: "active",
        ...textSearchFilter(search, ["title", "brand", "category", "description"]),
      };

      if (category && category !== "default" && category !== "All Categories") {
        filter.category = new RegExp(`^${category}$`, "i");
      }

      const maxPrice = parseFloat(req.query.maxPrice);
      const minRating = parseFloat(req.query.minRating);
      if (!Number.isNaN(maxPrice) && maxPrice > 0) {
        filter.price = { $lte: maxPrice };
      }
      if (!Number.isNaN(minRating) && minRating > 0) {
        filter.rating = { $gte: minRating };
      }

      let sortQuery = { createdAt: -1 };
      if (sort === "rating") sortQuery = { rating: -1, createdAt: -1 };
      else if (sort === "discount") sortQuery = { discount: -1, createdAt: -1 };
      else if (sort === "price_asc") sortQuery = { price: 1 };
      else if (sort === "price_desc") sortQuery = { price: -1 };

      const totalItems = await ProductModel.countDocuments(filter);
      const products = await ProductModel.find(filter).sort(sortQuery).skip(skip).limit(perPage);

      responseReturn(res, 200, { products, totalItems, page, perPage });
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };

  // Single combined endpoint returning latest, topRated, and discount product lists
  get_home_products = async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 8;
      const baseFilter = { status: "active" };

      const [latestProducts, topRatedProducts, discountProducts] = await Promise.all([
        ProductModel.find(baseFilter).sort({ createdAt: -1 }).limit(limit),
        ProductModel.find(baseFilter).sort({ rating: -1, createdAt: -1 }).limit(limit),
        ProductModel.find({ ...baseFilter, discount: { $gt: 0 } }).sort({ discount: -1 }).limit(limit),
      ]);

      responseReturn(res, 200, { latestProducts, topRatedProducts, discountProducts });
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };

  get_product = async (req, res) => {
    try {
      const { id } = req.params;
      const product =
        (await ProductModel.findById(id)) ||
        (await ProductModel.findOne({ slug: id }));

      if (!product) {
        return responseReturn(res, 404, { error: "Product not found" });
      }
      responseReturn(res, 200, { product });
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };

  get_product_reviews = async (req, res) => {
    try {
      const { productId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const perPage = parseInt(req.query.perPage) || 10;
      const skip = (page - 1) * perPage;

      const totalItems = await ReviewModel.countDocuments({ productId, status: "visible" });
      const reviews = await ReviewModel.find({ productId, status: "visible" })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(perPage);

      responseReturn(res, 200, { reviews, totalItems, page, perPage });
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };

  submit_review = async (req, res) => {
    try {
      const { productId, productTitle, customerName, rating, comment } = req.body;
      if (!productId || !customerName || !rating) {
        return responseReturn(res, 400, { error: "productId, customerName and rating are required" });
      }

      const review = await ReviewModel.create({ productId, productTitle, customerName, rating, comment });

      // Recalculate average rating for the product
      const agg = await ReviewModel.aggregate([
        { $match: { productId, status: "visible" } },
        { $group: { _id: null, avg: { $avg: "$rating" } } },
      ]);
      const avgRating = agg[0]?.avg ? Math.round(agg[0].avg * 10) / 10 : rating;
      await ProductModel.findByIdAndUpdate(productId, { rating: avgRating });

      responseReturn(res, 201, { review, message: "Review submitted successfully" });
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };
}

module.exports = new publicController();
