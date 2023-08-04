const mongoose = require("mongoose");
const Unit = require("./unit");
const asyncHandler = require("express-async-handler");

const Schema = mongoose.Schema;

const ProductSchema = new Schema({
  name: { type: String, required: true, minLength: 3, maxLength: 100 },
  description: { type: String, required: true, minLength: 3, maxLength: 300 },
  image: { type: String, required: true },
  instrument: {
    type: Schema.Types.ObjectId,
    ref: "Instrument",
    required: true,
  },
});

// Virtual for product's URL
ProductSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/product/${this._id}`;
});

// Export model
module.exports = mongoose.model("Product", ProductSchema);
