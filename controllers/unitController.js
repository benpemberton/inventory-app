const Product = require("../models/product");
const Instrument = require("../models/instrument");
const Unit = require("../models/unit");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

// // Display list of all Products.
// exports.list = asyncHandler(async (req, res, next) => {
//   const allInstruments = await Instrument.find().sort({ name: 1 }).exec();
//   res.render("instrument/list", {
//     title: "Instruments",
//     instrument_list: allInstruments,
//   });
// });

// Display detail page for a specific Unit.
exports.detail = asyncHandler(async (req, res, next) => {
  // Get details of unit and parent product (in parallel)
  const unit = await Unit.findById(req.params.id).populate("product").exec();

  if (unit === null) {
    // No results.
    const err = new Error("Unit not found");
    err.status = 404;
    return next(err);
  }

  console.log(unit);

  res.render("unit/unit_detail", {
    title: "Unit Detail",
    unit: unit,
  });
});

// Display Unit create form on GET.
exports.create_get = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.productid).exec();

  res.render("unit/unit_form", {
    title: "Create Unit",
    product: product,
  });
});

// Handle Unit create form on POST.
exports.create_post = [
  // Validate and sanitize fields.
  body("name", "Name must be specified.")
    .trim()
    .isLength({ min: 3, max: 100 })
    .escape(),
  body("price", "Unit requires a price.")
    .trim()
    .isNumeric({ min: 1, max: 100000 })
    .escape(),
  body("condition", "Condition must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("location", "Location must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create Unit object with escaped and trimmed data
    const unit = new Unit({
      product: req.productid,
      price: req.body.price,
      condition: req.body.condition,
      location: req.body.location,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.

      // Get parent product for form.
      const product = await Product.findById(req.productid).exec();

      res.render("unit/unit_form", {
        title: "Create Unit",
        unit: unit,
        product: product,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid.

      // Save unit.
      await unit.save();
      // Redirect to new unit record.
      res.redirect(unit.url);
    }
  }),
];

// Display Unit delete form on GET.
exports.delete_get = asyncHandler(async (req, res, next) => {
  // Get details of unit
  const unit = await Unit.findById(req.params.id).populate("product").exec();

  if (unit === null) {
    // No results.
    res.redirect("/product");
  }

  res.render("unit/unit_delete", {
    title: "Delete Unit",
    unit: unit,
  });
});

// Handle Unit delete on POST.
exports.delete_post = asyncHandler(async (req, res, next) => {
  // Get details of unit
  const unit = await Unit.findById(req.params.id).exec();

  await Unit.findByIdAndRemove(req.body.unitid);
  res.redirect(`/product/${unit.product}`);
});

// Display Unit update form on GET.
exports.update_get = asyncHandler(async (req, res, next) => {
  // Get unit for form.
  const unit = await Unit.findById(req.params.id).populate("product").exec();

  if (unit === null) {
    // No results.
    const err = new Error("Unit not found");
    err.status = 404;
    return next(err);
  }
  res.render("unit/unit_form", {
    title: "Update Unit",
    unit: unit,
  });
});

// Handle unit update on POST.
exports.update_post = [
  // Validate and sanitize fields.
  body("name", "Name must be specified.")
    .trim()
    .isLength({ min: 3, max: 100 })
    .escape(),
  body("price", "Unit requires a price.")
    .trim()
    .isNumeric({ min: 1, max: 100000 })
    .escape(),
  body("condition", "Condition must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("location", "Location must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create Unit object with escaped/trimmed data and old id.
    const unit = new Unit({
      product: req.productid,
      price: req.body.price,
      condition: req.body.condition,
      location: req.body.location,
      _id: req.params.id, // This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      res.render("unit/unit_form", {
        title: "Update Unit",
        unit: unit,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid. Update the record.
      const theunit = await Unit.findByIdAndUpdate(req.params.id, unit, {});
      // Redirect to book detail page.
      res.redirect(theunit.url);
    }
  }),
];
