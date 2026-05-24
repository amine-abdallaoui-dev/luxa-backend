require("dotenv").config();
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const { dbConnect } = require("../utils/dbConnect");

const adminModel = require("../models/adminModel");
const sellerModel = require("../models/sellerModel");
const CategoryModel = require("../models/CategoryModel");
const ProductModel = require("../models/productModel");
const BrandModel = require("../models/brandModel");
const OrderModel = require("../models/orderModel");
const CustomerModel = require("../models/customerModel");
const ReviewModel = require("../models/reviewModel");
const TransactionModel = require("../models/transactionModel");

const img = (seed) => `https://picsum.photos/seed/${seed}/600/600`;

const categories = [
  { name: "Fashion", slug: "fashion", image: img("fashion") },
  { name: "Electronics", slug: "electronics", image: img("electronics") },
  { name: "Gaming", slug: "gaming", image: img("gaming") },
  { name: "Shoes", slug: "shoes", image: img("shoes") },
  { name: "Beauty", slug: "beauty", image: img("beauty") },
  { name: "Furniture", slug: "furniture", image: img("furniture") },
];

const brands = [
  { name: "Nike", slug: "nike", image: img("nike") },
  { name: "Apple", slug: "apple", image: img("apple") },
  { name: "Sony", slug: "sony", image: img("sony") },
  { name: "Samsung", slug: "samsung", image: img("samsung") },
  { name: "Adidas", slug: "adidas", image: img("adidas") },
];

const productTitles = [
  "Wireless Noise Cancelling Headphones",
  "Smart Fitness Watch Pro",
  "Ultra HD Gaming Monitor 27inch",
  "Premium Leather Sneakers",
  "Organic Skincare Gift Set",
  "Modern Minimalist Desk Lamp",
  "Bluetooth Portable Speaker",
  "4K Action Camera Bundle",
  "Ergonomic Office Chair",
  "Stainless Steel Water Bottle",
  "Mechanical Keyboard RGB",
  "Cotton Hoodie Streetwear",
  "Wireless Charging Pad",
  "Smart Home Security Camera",
  "Running Shoes Lightweight",
  "Laptop Stand Aluminum",
  "Vitamin C Serum Face Care",
  "Gaming Mouse Wireless",
  "Wooden Bookshelf Unit",
  "Polarized Sunglasses Classic",
  "Tablet Case with Keyboard",
  "Yoga Mat Non Slip",
  "Electric Kettle Glass",
  "Denim Jacket Vintage",
  "Phone Tripod Flexible",
];

async function seed() {
  await dbConnect();

  await Promise.all([
    adminModel.deleteMany({}),
    sellerModel.deleteMany({}),
    CategoryModel.deleteMany({}),
    ProductModel.deleteMany({}),
    BrandModel.deleteMany({}),
    OrderModel.deleteMany({}),
    CustomerModel.deleteMany({}),
    ReviewModel.deleteMany({}),
    TransactionModel.deleteMany({}),
  ]);

  const adminPassword = await bcrypt.hash("admin123", 10);
  const sellerPassword = await bcrypt.hash("seller123", 10);

  await adminModel.create({
    email: "admin@shop.com",
    password: adminPassword,
    role: "admin",
    image: img("admin"),
  });

  const sellers = await sellerModel.insertMany([
    {
      name: "Tech Store",
      email: "seller1@shop.com",
      password: sellerPassword,
      shopName: "Tech Galaxy",
      country: "Morocco",
      city: "Casablanca",
      phone: "+212600000001",
      status: "active",
      shopStatus: "open",
    },
    {
      name: "Fashion Hub",
      email: "seller2@shop.com",
      password: sellerPassword,
      shopName: "Style Avenue",
      country: "Morocco",
      city: "Rabat",
      phone: "+212600000002",
      status: "active",
      shopStatus: "open",
    },
  ]);

  const seededCategories = await CategoryModel.insertMany(categories);
  await BrandModel.insertMany(brands);

  const products = productTitles.map((title, index) => {
    const category =
      seededCategories[index % seededCategories.length].name;
    const seller = sellers[index % sellers.length];
    const price = 49 + index * 7;
    return {
      title,
      slug: title.toLowerCase().split(/\s+/).join("-"),
      brand: brands[index % brands.length].name,
      category,
      stock: 20 + (index % 15),
      price,
      discount: index % 3 === 0 ? 15 : 5,
      description: `${title} — premium quality multi-vendor product for demo storefront.`,
      images: [img(`product-${index}`), img(`product-alt-${index}`)],
      rating: 3 + (index % 3),
      status: "active",
      sellerId: String(seller._id),
    };
  });

  const seededProducts = await ProductModel.insertMany(products);

  const customerPassword = await bcrypt.hash("customer123", 10);

  const customers = await CustomerModel.insertMany([
    {
      name: "Youssef Benali",
      email: "youssef@mail.com",
      password: customerPassword,
      phone: "+212611111111",
      ordersCount: 3,
      image: img("cust1"),
    },
    {
      name: "Sara El Amrani",
      email: "sara@mail.com",
      password: customerPassword,
      phone: "+212622222222",
      ordersCount: 5,
      image: img("cust2"),
    },
    {
      name: "Omar Idrissi",
      email: "omar@mail.com",
      password: customerPassword,
      phone: "+212633333333",
      ordersCount: 2,
      image: img("cust3"),
    },
    {
      name: "Lina Zahra",
      email: "lina@mail.com",
      password: customerPassword,
      phone: "+212644444444",
      ordersCount: 7,
      image: img("cust4"),
    },
    {
      name: "Karim Alaoui",
      email: "karim@mail.com",
      password: customerPassword,
      phone: "+212655555555",
      ordersCount: 1,
      image: img("cust5"),
    },
  ]);

  const paymentStatuses = ["paid", "pending", "paid", "failed", "paid"];
  const deliveryStatuses = [
    "delivered",
    "pending",
    "processing",
    "shipped",
    "pending",
  ];

  const orders = [];
  for (let i = 0; i < 20; i++) {
    const product = seededProducts[i % seededProducts.length];
    const customer = customers[i % customers.length];
    const qty = 1 + (i % 3);
    const totalPrice = product.price * qty;
    orders.push({
      orderId: `ORD-${1000 + i}`,
      customerName: customer.name,
      customerEmail: customer.email,
      products: [
        {
          productId: String(product._id),
          title: product.title,
          qty,
          price: product.price,
        },
      ],
      totalPrice,
      paymentStatus: paymentStatuses[i % paymentStatuses.length],
      deliveryStatus: deliveryStatuses[i % deliveryStatuses.length],
      sellerId: product.sellerId,
    });
  }
  const seededOrders = await OrderModel.insertMany(orders);

  await ReviewModel.insertMany(
    seededProducts.slice(0, 12).map((product, index) => ({
      productId: String(product._id),
      productTitle: product.title,
      customerName: customers[index % customers.length].name,
      rating: 3 + (index % 3),
      comment: `Great product! ${product.title} exceeded expectations.`,
      status: index % 5 === 0 ? "hidden" : "visible",
    }))
  );

  await TransactionModel.insertMany(
    seededOrders.map((order, index) => ({
      transactionId: `TXN-${9000 + index}`,
      orderId: order.orderId,
      customerName: order.customerName,
      amount: order.totalPrice,
      method: index % 2 === 0 ? "card" : "paypal",
      status: order.paymentStatus === "paid" ? "completed" : "pending",
    }))
  );

  console.log("Seed completed successfully.");
  console.log("Admin login: admin@shop.com / admin123");
  console.log("Seller login: seller1@shop.com / seller123");
  console.log("Customer login: youssef@mail.com / customer123");
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
