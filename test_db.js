const mongoose = require('mongoose');
const OrderModel = require('./models/orderModel');
require('dotenv').config();

mongoose.connect('mongodb://127.0.0.1:27017/ecommerce-app').then(async () => {
    const orders = await OrderModel.find({});
    let totalPaid = 0;
    let totalDelivered = 0;
    let totalAmount = 0;
    for (let o of orders) {
        if (o.paymentStatus === 'paid') totalPaid += o.totalPrice;
        if (o.deliveryStatus === 'delivered') totalDelivered += o.totalPrice;
        totalAmount += o.totalPrice;
    }
    console.log("Total Paid: ", totalPaid);
    console.log("Total Delivered: ", totalDelivered);
    console.log("Total Amount: ", totalAmount);
    process.exit(0);
});
