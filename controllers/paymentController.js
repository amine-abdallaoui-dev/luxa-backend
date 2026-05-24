

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const mongoose = require("mongoose");
const PaymentRequest = require("../models/paymentRequestModel");
const OrderModel = require("../models/orderModel");
// Must require sellerModel so Mongoose registers "sellers" schema before populate()
require("../models/sellerModel");
const { responseReturn } = require("../utils/responseReturn");

class paymentController {
  // Seller: request a payment withdrawal
  request_payment = async (req, res) => {
    try {
      const sellerId = req.id;
      const { amount } = req.body;

      if (!amount || amount <= 0) {
        return responseReturn(res, 400, { error: "Invalid amount" });
      }

      const request = await PaymentRequest.create({ sellerId, amount });
      responseReturn(res, 201, {
        request,
        message: "Payment request submitted successfully",
      });
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };

  // Seller: get own payment requests
  get_payment_requests = async (req, res) => {
    try {
      const sellerId = req.id;
      const page = parseInt(req.query.page) || 1;
      const perPage = parseInt(req.query.perPage) || 10;
      const skip = (page - 1) * perPage;

      const totalItems = await PaymentRequest.countDocuments({ sellerId });
      const requests = await PaymentRequest.find({ sellerId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(perPage);

      responseReturn(res, 200, { requests, totalItems, page, perPage });
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };

  // Admin: get all payment requests
  admin_get_payment_requests = async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const perPage = parseInt(req.query.perPage) || 10;
      const status = req.query.status || null;
      const skip = (page - 1) * perPage;
      const filter = status ? { status } : {};

      const totalItems = await PaymentRequest.countDocuments(filter);
      const requests = await PaymentRequest.find(filter)
        .populate("sellerId", "name email shopInfo")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(perPage);

      responseReturn(res, 200, { requests, totalItems, page, perPage });
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };

  // Admin: approve a payment request (simulated Stripe transfer)
  approve_payment = async (req, res) => {
    try {
      const { requestId, adminNote } = req.body;

      const request = await PaymentRequest.findById(requestId).populate(
        "sellerId"
      );
      if (!request) {
        return responseReturn(res, 404, { error: "Request not found" });
      }
      if (request.status !== "pending") {
        return responseReturn(res, 400, {
          error: "Request has already been processed",
        });
      }

      let stripeTransferId = null;

      // Attempt real Stripe transfer if seller has a stripeAccountId
      const sellerStripeAccount = request.sellerId?.stripeAccountId;
      if (sellerStripeAccount && process.env.STRIPE_SECRET_KEY) {
        try {
          const transfer = await stripe.transfers.create({
            amount: Math.round(request.amount * 100), // cents
            currency: "usd",
            destination: sellerStripeAccount,
            description: `Payout for seller ${request.sellerId._id}`,
          });
          stripeTransferId = transfer.id;
        } catch (stripeError) {
          // Stripe failed — simulate the transfer
          stripeTransferId = `simulated_${Date.now()}`;
          console.warn(
            "Stripe transfer simulation (Connect not configured):",
            stripeError.message
          );
        }
      } else {
        // No Stripe account configured — simulate
        stripeTransferId = `simulated_${Date.now()}`;
      }

      request.status = "approved";
      request.stripeTransferId = stripeTransferId;
      request.adminNote = adminNote || "";
      await request.save();

      responseReturn(res, 200, {
        request,
        message: `Payment of $${request.amount} approved`,
      });
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };

  // Admin: reject a payment request
  reject_payment = async (req, res) => {
    try {
      const { requestId, adminNote } = req.body;

      const request = await PaymentRequest.findById(requestId);
      if (!request) {
        return responseReturn(res, 404, { error: "Request not found" });
      }
      if (request.status !== "pending") {
        return responseReturn(res, 400, {
          error: "Request has already been processed",
        });
      }

      request.status = "rejected";
      request.adminNote = adminNote || "";
      await request.save();

      responseReturn(res, 200, {
        request,
        message: "Payment request rejected",
      });
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };

  // Seller: get payment summary stats
  get_payment_stats = async (req, res) => {
    try {
      const sellerId = req.id;
      const oid = new mongoose.Types.ObjectId(sellerId);

      const [totalRequestedRes, totalApprovedRes, pendingCount, revenueRes] = await Promise.all([
        PaymentRequest.aggregate([
          { $match: { sellerId: oid } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        PaymentRequest.aggregate([
          { $match: { sellerId: oid, status: "approved" } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        PaymentRequest.countDocuments({ sellerId, status: "pending" }),
        OrderModel.aggregate([
          { $match: { sellerId: String(sellerId), paymentStatus: "paid" } },
          { $group: { _id: null, total: { $sum: "$totalPrice" } } },
        ]),
      ]);

      const totalRevenue = revenueRes[0]?.total || 0;
      const totalApproved = totalApprovedRes[0]?.total || 0;

      responseReturn(res, 200, {
        totalRequested: totalRequestedRes[0]?.total || 0,
        totalApproved,
        pendingCount,
        netBalance: Math.max(0, totalRevenue - totalApproved),
      });
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };
}

module.exports = new paymentController();
