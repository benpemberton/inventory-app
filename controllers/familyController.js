const Family = require("../models/family");
const Instrument = require("../models/instrument");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

// Display list of all Families.
exports.list = asyncHandler(async (req, res, next) => {
  const allFamilies = await Family.find().sort({ name: 1 }).exec();
  res.render("family/family_list", {
    title: "Families",
    family_list: allFamilies,
  });
});

// Display detail page for a specific Family.
exports.detail = asyncHandler(async (req, res, next) => {
  // Get details of family and all their instruments (in parallel)
  const [family, instrumentsInFamily] = await Promise.all([
    Family.findById(req.params.id).exec(),
    Instrument.find({ family: req.params.id }, "name description").exec(),
  ]);

  if (family === null) {
    // No results.
    const err = new Error("Family not found");
    err.status = 404;
    return next(err);
  }

  res.render("family/family_detail", {
    title: "Family Detail",
    family: family,
    instruments: instrumentsInFamily,
  });
});
