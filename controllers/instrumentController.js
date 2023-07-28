const Instrument = require("../models/instrument");
const Family = require("../models/family");
const Product = require("../models/product");
const Unit = require("../models/unit");
const { getChildrenAndUrls } = require("../utils/getChildrenAndUrls");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

// Display list of all Instruments.
exports.list = asyncHandler(async (req, res, next) => {
  const allInstruments = await Instrument.find()
    .sort({ name: 1 })
    .populate("family")
    .exec();

  // get URL values from Mongoose doc and count children for each object
  let newArray = await getChildrenAndUrls(
    allInstruments,
    Product,
    "instrument"
  );

  res.render("instrument/instrument_list", {
    title: "Instruments",
    instrument_list: newArray,
  });
});

// Display detail page for a specific Instrument.
exports.detail = asyncHandler(async (req, res, next) => {
  // Get details of instrument and all associated products (in parallel)
  const [instrument, allProducts] = await Promise.all([
    Instrument.findById(req.params.id).exec(),
    Product.find({ instrument: req.params.id }, "name description").exec(),
  ]);

  if (instrument === null) {
    // No results.
    const err = new Error("Instrument not found");
    err.status = 404;
    return next(err);
  }

  // get URL values from Mongoose doc and count units for each product
  let newArray = await getChildrenAndUrls(allProducts, Unit, "product");

  res.render("instrument/instrument_detail", {
    title: instrument.name,
    instrument: instrument,
    products: newArray,
  });
});

// Display Instrument create form on GET.
exports.create_get = asyncHandler(async (req, res, next) => {
  const allFamilies = await Family.find().exec();

  res.render("instrument/instrument_form", {
    title: "Create Instrument",
    families: allFamilies,
  });
});

// Handle Instrument create form on POST.
exports.create_post = [
  // Validate and sanitize fields.
  body("name", "Name must be specified.")
    .trim()
    .isLength({ min: 3, max: 100 })
    .escape(),
  body("description", "Instrument requires a proper description.")
    .trim()
    .isLength({ min: 3, max: 200 })
    .escape(),
  body("family", "Family must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create Instrument object with escaped and trimmed data
    const instrument = new Instrument({
      name: req.body.name,
      description: req.body.description,
      family: req.body.family,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.

      // Get all families for form.
      const allFamilies = await Family.find().exec();

      res.render("instrument/instrument_form", {
        title: "Create Instrument",
        instrument: instrument,
        families: allFamilies,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid.

      // Save instrument.
      await instrument.save();
      // Redirect to new instrument record.
      res.redirect(instrument.url);
    }
  }),
];

// Display Instrument delete form on GET.
exports.delete_get = asyncHandler(async (req, res, next) => {
  // Get details of instrument and all its associated products (in parallel)
  const [instrument, assocProducts] = await Promise.all([
    Instrument.findById(req.params.id).exec(),
    Product.find({ instrument: req.params.id }, "name description").exec(),
  ]);

  if (instrument === null) {
    // No results.
    res.redirect("/instrument");
  }

  res.render("instrument/instrument_delete", {
    title: "Delete Instrument",
    instrument: instrument,
    products: assocProducts,
  });
});

// Handle Instrument delete on POST.
exports.delete_post = asyncHandler(async (req, res, next) => {
  // Get details of instrument and all its associated products (in parallel)
  const [instrument, assocProducts] = await Promise.all([
    Instrument.findById(req.params.id).exec(),
    Product.find({ instrument: req.params.id }, "name description").exec(),
  ]);

  if (assocProducts.length > 0) {
    // Instrument has products. Render in same way as for GET route.
    res.render("instrument/instrument_delete", {
      title: "Delete Instrument",
      instrument: instrument,
      products: assocProducts,
    });
    return;
  } else {
    // Instrument has no products. Delete object and redirect to the list of instrument.
    await Instrument.findByIdAndRemove(req.body.instrumentid);
    res.redirect("/instrument");
  }
});

// Display Instrument update form on GET.
exports.update_get = asyncHandler(async (req, res, next) => {
  // Get instrument and families for form.
  const [instrument, allFamilies] = await Promise.all([
    Instrument.findById(req.params.id).exec(),
    Family.find().exec(),
  ]);

  if (instrument === null) {
    // No results.
    const err = new Error("Instrument not found");
    err.status = 404;
    return next(err);
  }
  res.render("instrument/instrument_form", {
    title: "Update Instrument",
    instrument: instrument,
    families: allFamilies,
  });
});

// Handle Instrument update on POST.
exports.update_post = [
  // Validate and sanitize fields.
  body("name")
    .trim()
    .isLength({ min: 3, max: 100 })
    .escape()
    .withMessage("Name must be specified.")
    .isAlphanumeric()
    .withMessage("Name has non-alphanumeric characters."),
  body("description", "Instrument requires a proper description.")
    .trim()
    .isLength({ min: 3, max: 200 })
    .escape(),
  body("family", "Family must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create Instrument object with escaped/trimmed data and old id.
    const instrument = new Instrument({
      name: req.body.name,
      description: req.body.description,
      family: req.body.family,
      _id: req.params.id, // This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get families for form.
      const allFamilies = Family.find().exec();

      res.render("instrument/instrument_form", {
        title: "Update Instrument",
        instrument: instrument,
        families: allFamilies,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid. Update the record.
      const theinstrument = await Instrument.findByIdAndUpdate(
        req.params.id,
        instrument,
        {}
      );
      // Redirect to book detail page.
      res.redirect(theinstrument.url);
    }
  }),
];
