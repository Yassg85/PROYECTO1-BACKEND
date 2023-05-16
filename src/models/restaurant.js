import mongoose from "mongoose";

const Schema = mongoose.Schema;

const RestaurantSchema = new Schema({
  name: { type: String, required: [true, "Name is required."] },
  popularity: { type: Number, default: 0 },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "Admin is required."],
    ref: "User"
  },
  category: { type: String, required: [true, "Category is required."] },
});

const Restaurant = mongoose.model("Restaurant", RestaurantSchema);

export default Restaurant;