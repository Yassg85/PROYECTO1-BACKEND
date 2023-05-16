import mongoose from "mongoose";

const Schema = mongoose.Schema;

const ProductSchema = new Schema({
  name: { type: String, required: [true, "Name is required."] },
  price: { type: Number, required: [true, "Price is required."] },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "Restaurant is required."],
    ref: "Restaurant"
  },
  category: { type: String, required: [true, "Category is required."] },
});

const Product = mongoose.model("Product", ProductSchema);

export default Product;