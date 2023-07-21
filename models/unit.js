const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UnitSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  price: {
    type: Number,
    min: 1,
    max: 100000,
    required: true,
  },
  condition: {
    type: String,
    required: true,
    enum: ["New", "Good", "Used"],
    default: "new",
  },
  location: {
    type: String,
    required: true,
    enum: ["UK", "Europe", "USA"],
    default: "UK",
  },
});

// Virtual for unit's URL
UnitSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/product/${this.product._id}/unit/${this._id}`;
});

// Export model
module.exports = mongoose.model("Unit", UnitSchema);
