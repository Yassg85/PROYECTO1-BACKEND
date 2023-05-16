import mongoose from "mongoose";

const Schema = mongoose.Schema;

const orderStatus = ["PENDING", "ACCEPTED", "REJECTED", "DELIVERED"];

const OrderSchema = new Schema({
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "Products are required."],
    ref: "Product"
  }],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "User is required."],
    ref: "User"
  },
  domiciliary: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "Domiciliary is required."],
    ref: "User"
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "Restaurant is required."],
    ref: "Restaurant"
  },
  status: {
    type: String,
    required: [true, "Status is required."],
    enum: orderStatus,
    default: "pending"
  },
  date: { type: Date, default: Date.now },
});

const Order = mongoose.model("Order", OrderSchema);

export default Order;