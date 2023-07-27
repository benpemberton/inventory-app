const Family = require("../models/family");
const Instrument = require("../models/instrument");
const Product = require("../models/product");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

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

  let newArray = [];

  // get URL values from Mongoose doc and count products for each instrument
  const getProductsAndUrls = async () => {
    if (instrumentsInFamily) {
      for (let instrument of instrumentsInFamily) {
        let obj = instrument.toObject();
        obj.url = instrument.url;
        let products = await Product.find({
          instrument: obj._id,
        }).exec();
        obj.products = products.length;
        newArray.push(obj);
      }
    }
  };

  await getProductsAndUrls();

  res.render("family/family_detail", {
    title: "Family Detail",
    family: family,
    instrument_list: newArray,
  });
});
