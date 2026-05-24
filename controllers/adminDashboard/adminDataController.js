const BrandModel = require("../../models/brandModel");
const ReviewModel = require("../../models/reviewModel");
const CustomerModel = require("../../models/customerModel");
const TransactionModel = require("../../models/transactionModel");
const OrderModel = require("../../models/orderModel");
const ProductModel = require("../../models/productModel");
const SellerModel = require("../../models/sellerModel");
const PaymentRequest = require("../../models/paymentRequestModel");
const { responseReturn } = require("../../utils/responseReturn");
const { buildListQuery, textSearchFilter } = require("../../utils/queryHelper");
const bcrypt = require("bcrypt");
const formidable = require("formidable");
const {v2: cloudinary} = require("cloudinary");
const brandModel = require("../../models/brandModel")

const listHandler = (Model, searchFields, extraFilter = () => ({})) => {
  return async (req, res) => {
    try {
      const { page, perPage, skip, search } = buildListQuery(req.query);
      const filter = {
        ...textSearchFilter(search, searchFields),
        ...extraFilter(req.query),
      };
      const totalItems = await Model.countDocuments(filter);
      const items = await Model.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(perPage);
      responseReturn(res, 200, { items, totalItems, page, perPage });
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };
};

class adminDataController {
  get_brands = listHandler(BrandModel, ["name", "slug"]);
  get_reviews = listHandler(ReviewModel, [
    "customerName",
    "productTitle",
    "comment",
  ]);
  get_customers = listHandler(CustomerModel, ["name", "email", "phone"]);
  get_transactions = listHandler(TransactionModel, [
    "transactionId",
    "orderId",
    "customerName",
  ]);

  addBrand = async (req, res) => {

      const form = formidable()

      form.parse(req,async(err,fields,files)=>{
        const {name} = fields;
        const {image} = files;
        if(err){
          responseReturn(res,500, { error: err.message });
        }else {
          try {
            let  slug = name.trim()
            let newSlug = slug.split(" ").join("-")

            cloudinary.config({
              cloud_name: process.env.cloud_name,
              api_key:  process.env.api_key,
              api_secret: process.env.api_secret
            });

            const result = await cloudinary.uploader.upload(image.filepath)
            if(!result) {
              return res.status(401).end("image upload fail")
            }
            if(result){
              const cat = await brandModel.create({
                name : name,
                slug : newSlug,
                image : result.url
              })
              responseReturn(res,201,{cat,message : "Brand added successfully"})
            }else{
              responseReturn(res,401,{error : "something wrong try again !"})
            }
          } catch (error) {
            responseReturn(res,500,{error : error.message})

          }
        }

      })

  }

  getAllBrands = async (req, res) => {
    try{
        const data = await  brandModel.find({})
        if(data){
          responseReturn(res,200,data)
        }
    }catch(error){
      responseReturn(res,500,{error : error.message})
    }
  }
  get_sellers = async (req, res) => {
    try {
      const { page, perPage, skip, search } = buildListQuery(req.query);
      const filter = textSearchFilter(search, [
        "name",
        "email",
        "shopName",
        "country",
        "city",
      ]);
      const totalItems = await SellerModel.countDocuments(filter);
      const sellers = await SellerModel.find(filter)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(perPage);
      responseReturn(res, 200, { items: sellers, totalItems, page, perPage });
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };

  add_seller = async (req, res) => {
    try {
      const { name, email, shopName, password, country, city, phone } = req.body;
      const exist = await SellerModel.findOne({ email });
      if (exist) {
        return responseReturn(res, 400, { error: "Email already exists" });
      }
      const hashPassword = await bcrypt.hash(password, 10);
      const seller = await SellerModel.create({
        name,
        email,
        shopName,
        password: hashPassword,
        country,
        city,
        phone,
      });
      responseReturn(res, 201, { message: "Seller created successfully", seller });
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };

  edit_seller = async (req, res) => {
    try {
      const { id } = req.params;
      const { name, email, shopName, password, country, city, phone, status, shopStatus } = req.body;

      let updateData = { name, email, shopName, country, city, phone, status, shopStatus };
      if (password) {
        updateData.password = await bcrypt.hash(password, 10);
      }

      const seller = await SellerModel.findByIdAndUpdate(id, updateData, { new: true });
      responseReturn(res, 200, { message: "Seller updated successfully", seller });
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };

  delete_seller = async (req, res) => {
    try {
      const { id } = req.params;
      await SellerModel.findByIdAndDelete(id);
      responseReturn(res, 200, { message: "Seller deleted successfully" });
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };

  get_dashboard_stats = async (req, res) => {
    try {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const currentYear = new Date().getFullYear();

      const [
        totalOrders,
        pendingOrders,
        totalProducts,
        totalSellers,
        totalCustomers,
        revenueAgg,
        totalPaidOutAgg,
        monthlyOrders,
        monthlyRevenue,
        monthlySellers,
        monthlyProducts
      ] = await Promise.all([
        OrderModel.countDocuments(),
        OrderModel.countDocuments({ deliveryStatus: "pending" }),
        ProductModel.countDocuments(),
        SellerModel.countDocuments(),
        CustomerModel.countDocuments(),
        // Gross revenue: all paid orders
        OrderModel.aggregate([
          { $match: { paymentStatus: "paid" } },
          { $group: { _id: null, total: { $sum: "$totalPrice" } } },
        ]),
        // Total paid out to sellers (approved payment requests)
        PaymentRequest.aggregate([
          { $match: { status: "approved" } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        OrderModel.aggregate([
          { $match: { createdAt: { $gte: new Date(`${currentYear}-01-01`), $lte: new Date(`${currentYear}-12-31`) } } },
          { $group: { _id: { $month: "$createdAt" }, count: { $sum: 1 } } }
        ]),
        OrderModel.aggregate([
          { $match: { paymentStatus: "paid", createdAt: { $gte: new Date(`${currentYear}-01-01`), $lte: new Date(`${currentYear}-12-31`) } } },
          { $group: { _id: { $month: "$createdAt" }, total: { $sum: "$totalPrice" } } }
        ]),
        SellerModel.aggregate([
          { $match: { createdAt: { $gte: new Date(`${currentYear}-01-01`), $lte: new Date(`${currentYear}-12-31`) } } },
          { $group: { _id: { $month: "$createdAt" }, count: { $sum: 1 } } }
        ]),
        ProductModel.aggregate([
          { $match: { createdAt: { $gte: new Date(`${currentYear}-01-01`), $lte: new Date(`${currentYear}-12-31`) } } },
          { $group: { _id: { $month: "$createdAt" }, count: { $sum: 1 } } }
        ])
      ]);

      const formatMonthlyData = (data, valueKey = "count") => {
        const formatted = new Array(12).fill(0);
        data.forEach(item => {
          formatted[item._id - 1] = item[valueKey];
        });
        return formatted;
      };

      const totalRevenue = Math.round((revenueAgg[0]?.total || 0) * 100) / 100;
      const totalPaidOut = Math.round((totalPaidOutAgg[0]?.total || 0) * 100) / 100;
      const netRevenue = Math.round(Math.max(0, totalRevenue - totalPaidOut) * 100) / 100;

      responseReturn(res, 200, {
        stats: {
          totalOrders,
          pendingOrders,
          totalProducts,
          totalSellers,
          totalCustomers,
          totalRevenue,
          totalPaidOut,
          netRevenue,
          // Keep backward-compat field
          revenue: netRevenue,
          chartData: {
            labels: months,
            orders: formatMonthlyData(monthlyOrders, "count"),
            revenue: formatMonthlyData(monthlyRevenue, "total"),
            sellers: formatMonthlyData(monthlySellers, "count"),
            products: formatMonthlyData(monthlyProducts, "count"),
          }
        },
      });
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };
}

module.exports = new adminDataController();
