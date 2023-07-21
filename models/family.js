const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const FamilySchema = new Schema({
  name: { type: String, required: true, minLength: 3, maxLength: 100 },
});

// Virtual for genre's URL
FamilySchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/family/${this._id}`;
});

// Export model
module.exports = mongoose.model("Family", FamilySchema);
