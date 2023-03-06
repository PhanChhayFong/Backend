const { Order } = require("../models/order");
const express = require("express");
const { OrderItem } = require("../models/order-item");
const mongoose = require("mongoose");
const router = express.Router();

// get all ordered
router.get(`/`, async (req, res) => {
  const orderList = await Order.find()
    .populate("user")
    .sort({ dateOrdered: -1 });
  if (!orderList) res.status(500).json({ success: false });
  res.send(orderList);
});
// get order item by each user
router.get(`/item-order/:userid`, async (req, res) => {
  const userId = req.params.userid;

  if (!mongoose.isValidObjectId(userId)) {
    return res.status(400).json({ success: false });
  }
  const orderList = await Order.find({
    user: userId,
    status: { $in: ["Ordered", "Delivering", "Success"] },
  }).sort({ dateOrdered: -1 });
  if (!orderList) {
    return res.status(404).json({ success: false });
  }

  return res.send(orderList);
});
// get all ordered by id
router.get(`/:id`, async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user")
    .populate({
      path: "orderItems",
      populate: {
        path: "product",
        populate: "category",
      },
    });
  if (!order) res.status(500).json({ success: false });
  res.send(order);
});
// get totalsales
router.get("/get/totalsales", async (req, res) => {
  const totalSales = await Order.aggregate([
    { $group: { _id: null, totalsales: { $sum: "$totalPrice" } } },
  ]);

  if (!totalSales) {
    return res.status(400).send("The order sales cannot be generated");
  }

  res.send({ totalsales: totalSales.pop().totalsales });
});
// count order
router.get(`/getcount/count`, async (req, res) => {
  const orderCount = await Order.countDocuments();

  if (!orderCount) res.status(500).json({ success: false });
  res.send({
    orderCount: orderCount,
  });
});
// get order item by user id
router.get(`/get/userorders/:userid`, async (req, res) => {
  const userOrderList = await Order.find({ user: req.params.userid })
    .populate({
      path: "orderItems",
      populate: {
        path: "product",
        populate: "category",
      },
    })
    .sort({ dateOrdered: -1 });
  if (!userOrderList) {
    res.status(500).json({ success: false });
  }
  res.send(userOrderList);
});
//sort the orders status
router.get(`/get/:status`, async (req, res) => {
  const orders = await Order.find({ status: req.params.status })
    .populate("user")
    .sort({ dateOrdered: -1 });
  if (!orders) res.status(500).json({ success: false });
  res.send(orders);
});
//getting orders data on the specific month
router.get(`/getSale/month`, async (req, res) => {
  const date = new Date();
  //$expr ===> build query expressions that compare fields from the same document in a $match stage
  //$eq   ===> matches documents where the value of a field equals the specified value
  const orders = await Order.find({
    $expr: { $eq: [{ $month: "$dateSuccess" }, date.getMonth() + 1] },
  })
    .populate("user")
    .sort({ dateOrdered: -1 });
  if (!orders) res.status(500).json({ success: false });
  res.send(orders);
});
// count total purchased
router.get(`/total-purchased/:userid`, async (req, res) => {
  const userId = req.params.userid;

  if (!mongoose.isValidObjectId(userId)) {
    return res.status(400).json({ success: false });
  }

  const totalPurchased = await Order.find({
    user: userId,
    status: { $in: ["Ordered", "Delivering", "Success"] },
  }).countDocuments();

  res
    .status(200)
    .send({ totalPurchased: totalPurchased != 0 ? totalPurchased : 0 });
});
// count total delivery
router.get(`/total-delivery/:userid`, async (req, res) => {
  const userId = req.params.userid;

  if (!mongoose.isValidObjectId(userId)) {
    return res.status(400).json({ success: false });
  }

  const totalDelivery = await Order.find({
    user: userId,
    status: { $in: ["Delivering", "Success"] },
  }).countDocuments();

  res
    .status(200)
    .send({ totalDelivery: totalDelivery != 0 ? totalDelivery : 0 });
});
//add order
router.post("/", async (req, res) => {
  const orderItemsIds = Promise.all(
    req.body.orderItems.map(async (orderItem) => {
      let newOrderItem = new OrderItem({
        quantity: orderItem.quantity,
        product: orderItem.product,
      });
      newOrderItem = await newOrderItem.save();
      return newOrderItem._id;
    })
  );
  const orderItemsIdsResolved = await orderItemsIds;
  // const totalPrices = await Promise.all(
  //   orderItemsIdsResolved.map(async (orderItemId) => {
  //     const orderItem = await OrderItem.findById(orderItemId).populate(
  //       "product",
  //       "salePrice"
  //     );
  //     const totalPrice = orderItem.product.salePrice * orderItem.quantity;
  //     return totalPrice;
  //   })
  // );
  // const totalPrice = totalPrices.reduce((a, b) => a + b, 0);
  let order = new Order({
    orderItems: orderItemsIdsResolved,
    user: req.body.user,
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    phone: req.body.phone,
    email: req.body.email,
    shippingAddress: req.body.shippingAddress,
    city: req.body.city,
    country: req.body.country,
    tax: req.body.tax,
    subTotal: req.body.subTotal,
    status: req.body.status,
    totalPrice: req.body.totalPrice,
    Tmode: req.body.Tmode,
    Tstatus: req.body.Tstatus,
    TDate: req.body.TDate,
  });
  order = await order.save();

  if (!order) return res.status(400).send("the order cannot be created!");

  res.send(order);
});
//add order status to deliver or ordered by id
router.put("/:id", async (req, res) => {
  const state = await Order.findById(req.params.id).select("status -_id");
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    {
      status: state.status == "Delivering" ? "Ordered" : "Delivering",
      dateDelivered: state.status != "Delivering" ? Date.now() : "",
    },
    { new: true }
  );
  if (!order) return res.status(400).send("the order cannot be update!");

  res.send(order);
});
//add order status to success
router.put("/success/:id", async (req, res) => {
  const orderId = req.params.id;

  if (!mongoose.isValidObjectId(orderId)) {
    return res
      .status(404)
      .json({ success: false, message: "Order ID is not found..." });
  }
  const getOrder_Tstatus = await Order.findById(orderId);

  const order = await Order.findByIdAndUpdate(
    orderId,
    {
      status: "Success",
      dateSuccess: Date.now(),
      TDate: getOrder_Tstatus.Tstatus ? getOrder_Tstatus.TDate : Date.now(),
      Tstatus: true,
    },
    { new: true }
  );
  if (!order) return res.status(400).send("the order cannot be update!");

  res.send(order);
});
//delete order
router.delete("/:id", (req, res) => {
  Order.findByIdAndRemove(req.params.id)
    .then(async (order) => {
      if (order) {
        await order.orderItems.map(async (orderItem) => {
          await OrderItem.findByIdAndRemove(orderItem);
        });
        return res
          .status(200)
          .json({ success: true, message: "the order is deleted!" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "order not found!" });
      }
    })
    .catch((err) => {
      return res.status(500).json({ success: false, error: err });
    });
});
module.exports = router;
