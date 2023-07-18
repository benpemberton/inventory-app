const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler");

const Schema = mongoose.Schema;

const UnitSchema = new Schema({
  name: { type: String, required: true, minLength: 3, maxLength: 100 },
  description: { type: String, required: true, minLength: 3, maxLength: 200 },
  instrument: { type: Schema.Types.ObjectId, ref: "Instrument", required: true },
});

// Virtual for product's URL
UnitSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/product/${this._id}`;
});

// Export model
module.exports = mongoose.model("Unit", UnitSchema);