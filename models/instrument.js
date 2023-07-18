const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const InstrumentSchema = new Schema({
  name: { type: String, required: true, minLength: 3, maxLength: 100 },
  description: { type: String, required: true, minLength: 3, maxLength: 200 },
  family: { type: Schema.Types.ObjectId, ref: "Family", required: true },
});

// Virtual for genre's URL
InstrumentSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/instrument/${this._id}`;
});

// Export model
module.exports = mongoose.model("Instrument", InstrumentSchema);