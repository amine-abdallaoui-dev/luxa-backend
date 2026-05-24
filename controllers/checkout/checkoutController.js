const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not set in .env");
  }
  return require("stripe")(process.env.STRIPE_SECRET_KEY);
};
const ProductModel = require("../../models/productModel");
const OrderModel = require("../../models/orderModel");
const TransactionModel = require("../../models/transactionModel");
const customerModel = require("../../models/customerModel");
const { responseReturn } = require("../../utils/responseReturn");

const DELIVERY_FEE = 10;

const lineTotal = (price, discount, qty) => {
  const off = (price * (discount || 0)) / 100;
  return (price - off) * qty;
};

class checkoutController {
  create_payment_intent = async (req, res) => {
    try {
      const { items, shipping } = req.body;
      if (!items?.length) {
        return responseReturn(res, 400, { error: "Cart is empty" });
      }

      let subtotal = 0;
      const validated = [];

      for (const item of items) {
        const product = await ProductModel.findById(item.productId);
        if (!product || product.status !== "active") {
          return responseReturn(res, 400, {
            error: `Product unavailable: ${item.title || item.productId}`,
          });
        }
        const qty = Math.min(item.qty, product.stock);
        if (qty < 1) {
          return responseReturn(res, 400, { error: "Invalid quantity" });
        }
        const total = lineTotal(product.price, product.discount, qty);
        subtotal += total;
        validated.push({
          productId: String(product._id),
          title: product.title,
          qty,
          price: product.price,
          discount: product.discount,
          sellerId: product.sellerId,
          lineTotal: total,
        });
      }

      const amount = Math.round((subtotal + DELIVERY_FEE) * 100);

      const paymentIntent = await getStripe().paymentIntents.create({
        amount,
        currency: "usd",
        metadata: {
          customerId: String(req.id),
          itemCount: String(validated.length),
        },
        automatic_payment_methods: { enabled: true },
      });

      responseReturn(res, 200, {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: amount / 100,
        subtotal,
        deliveryFee: DELIVERY_FEE,
        items: validated,
        shipping,
      });
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };

  confirm_order = async (req, res) => {
    try {
      const { paymentIntentId, items, shipping } = req.body;
      if (!paymentIntentId || !items?.length) {
        return responseReturn(res, 400, { error: "Missing payment data" });
      }

      const paymentIntent = await getStripe().paymentIntents.retrieve(paymentIntentId);
      if (paymentIntent.status !== "succeeded") {
        return responseReturn(res, 400, {
          error: "Payment not completed",
          status: paymentIntent.status,
        });
      }

      const customer = await customerModel.findById(req.id);
      if (!customer) {
        return responseReturn(res, 404, { error: "Customer not found" });
      }

      const bySeller = {};
      let subtotal = 0;
      for (const item of items) {
        const product = await ProductModel.findById(item.productId);
        if (!product) continue;
        const qty = item.qty;
        await ProductModel.findByIdAndUpdate(product._id, {
          $inc: { stock: -qty },
        });
        const itemTotal =
          item.lineTotal ??
          lineTotal(product.price, product.discount, qty);
        subtotal += itemTotal;
        const sellerKey = product.sellerId || "platform";
        if (!bySeller[sellerKey]) bySeller[sellerKey] = { products: [], total: 0 };
        bySeller[sellerKey].products.push({
          productId: String(product._id),
          title: product.title,
          qty,
          price: product.price,
        });
        bySeller[sellerKey].total += itemTotal;
      }

      const sellerCount = Object.keys(bySeller).length || 1;
      const deliveryShare = DELIVERY_FEE / sellerCount;

      const orders = [];
      let orderIndex = Date.now();
      for (const [sellerId, group] of Object.entries(bySeller)) {
        const totalPrice = group.total + deliveryShare;
        const order = await OrderModel.create({
          orderId: `ORD-${orderIndex++}`,
          customerName: shipping?.name || customer.name,
          customerEmail: customer.email,
          customerId: String(customer._id),
          products: group.products,
          totalPrice,
          paymentStatus: "paid",
          deliveryStatus: "processing",
          sellerId,
          shippingAddress: shipping?.address || customer.address,
          shippingCity: shipping?.city || customer.city,
          shippingPhone: shipping?.phone || customer.phone,
        });
        orders.push(order);

        await TransactionModel.create({
          transactionId: `TXN-${orderIndex}`,
          orderId: order.orderId,
          customerName: customer.name,
          amount: order.totalPrice,
          method: "stripe",
          status: "completed",
        });
      }

      await customerModel.findByIdAndUpdate(customer._id, {
        $inc: { ordersCount: orders.length },
        ...(shipping?.address && { address: shipping.address }),
        ...(shipping?.city && { city: shipping.city }),
        ...(shipping?.phone && { phone: shipping.phone }),
      });

      responseReturn(res, 201, {
        orders,
        message: "Order placed successfully",
      });
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };
}

module.exports = new checkoutController();
