const Family = require("../models/family");
const Instrument = require("../models/instrument");
const Product = require("../models/product");
const { getChildrenAndUrls } = require("../utils/getChildrenAndUrls");
const asyncHandler = require("express-async-handler");

// Display detail page for a specific Family.
exports.detail = asyncHandler(async (req, res, next) => {
  // Get details of family and all their instruments (in parallel)
  const [family, instrumentsInFamily] = await Promise.all([
    Family.findById(req.params.id).exec(),
    Instrument.find({ family: req.params.id }).populate("family").exec(),
  ]);

  if (family === null) {
    // No results.
    const err = new Error("Family not found");
    err.status = 404;
    return next(err);
  }

  // get URL values from Mongoose doc and count children for each object
  let newArray = await getChildrenAndUrls(
    instrumentsInFamily,
    Product,
    "instrument"
  );
  
  res.render("family/family_detail", {
    title: family.name,
    family: family,
    instrument_list: newArray,
  });
});
