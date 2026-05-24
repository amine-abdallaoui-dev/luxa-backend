const OrderModel = require("../../models/orderModel");
const { responseReturn } = require("../../utils/responseReturn");
const { buildListQuery, textSearchFilter } = require("../../utils/queryHelper");

class ordersController {
  get_orders = async (req, res) => {
    try {
      const {
        page,
        perPage,
        skip,
        search,
        sellerId,
        paymentStatus,
        deliveryStatus,
      } = buildListQuery(req.query);

      const filter = {
        ...textSearchFilter(search, [
          "orderId",
          "customerName",
          "customerEmail",
        ]),
      };
      const scopedSellerId =
        req.role === "seller" ? String(req.id) : sellerId;
      if (scopedSellerId) filter.sellerId = scopedSellerId;
      if (paymentStatus) filter.paymentStatus = paymentStatus;
      if (deliveryStatus) filter.deliveryStatus = deliveryStatus;

      const totalItems = await OrderModel.countDocuments(filter);
      const orders = await OrderModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(perPage);

      responseReturn(res, 200, { orders, totalItems, page, perPage });
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };

  get_customer_orders = async (req, res) => {
    try {
      const customerId = req.id;
      const page = parseInt(req.query.page) || 1;
      const perPage = parseInt(req.query.perPage) || 10;
      const skip = (page - 1) * perPage;

      const filter = { customerId: String(customerId) };

      const totalItems = await OrderModel.countDocuments(filter);
      const orders = await OrderModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(perPage);

      responseReturn(res, 200, { orders, totalItems, page, perPage });
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };

  update_order_status = async (req, res) => {
    try {
      const { id, deliveryStatus, paymentStatus } = req.body;
      const update = {};
      if (deliveryStatus) update.deliveryStatus = deliveryStatus;
      if (paymentStatus) update.paymentStatus = paymentStatus;

      const order = await OrderModel.findByIdAndUpdate(id, update, {
        new: true,
      });
      if (!order) {
        return responseReturn(res, 404, { error: "Order not found" });
      }
      responseReturn(res, 200, { order, message: "Order updated" });
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };
}

module.exports = new ordersController();

