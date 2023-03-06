const mongoose = require("mongoose");

const orderSchema = mongoose.Schema({
  orderItems: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrderItem",
      required: true,
    },
  ],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  firstname: {
    type: String,
  },
  lastname: {
    type: String,
  },
  phone: {
    type: Number,
  },
  email: {
    type: String,
  },
  shippingAddress: {
    type: String,
  },
  city: {
    type: String,
  },
  country: {
    type: String,
  },
  status: {
    type: String,
    default: "Ordered",
  },
  tax: {
    type: Number,
    default: 10,
  },
  subTotal: {
    type: Number,
    default: 0,
  },
  totalPrice: {
    type: Number,
    default: 0,
  },
  dateOrdered: {
    type: Date,
    default: Date.now,
  },
  dateDelivered: {
    type: Date,
    default: "",
  },
  dateSuccess: {
    type: Date,
    default: "",
  },
  Tmode: {
    type: Boolean,
    default: false, //   false (cash) \\\\\\\\\\\\\  True (Payment Card)
  },
  Tstatus: {
    type: Boolean,
    default: false, //   false (Pending) \\\\\\\\\\\\\  True (purchesed)
  },
  TDate: {
    type: Date,
    default: "",
  },
});

orderSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

orderSchema.set("toJSON", { virtuals: true });

exports.Order = mongoose.model("Order", orderSchema);
