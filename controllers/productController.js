const Product = require("../models/product");
const Instrument = require("../models/instrument");
const Unit = require("../models/unit");
const { getChildrenAndUrls } = require("../utils/getChildrenAndUrls");
const { placeholderURL } = require("../utils/placeholderImageURL");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

// Display list of all Products.
exports.list = asyncHandler(async (req, res, next) => {
  const allProducts = await Product.find()
    .sort({ name: 1 })
    .populate("instrument")
    .exec();

  // get URL values from Mongoose doc and count children for each object
  let newArray = await getChildrenAndUrls(allProducts, Unit, "product");

  res.render("product/product_list", {
    title: "Products",
    products: newArray,
  });
});

// Display detail page for a specific Product.
exports.detail = asyncHandler(async (req, res, next) => {
  // Get details of product and its units (in parallel)
  const [product, productUnits] = await Promise.all([
    Product.findById(req.params.id).exec(),
    Unit.find({ product: req.params.id }).exec(),
  ]);

  if (product === null) {
    // No results.
    const err = new Error("Product not found");
    err.status = 404;
    return next(err);
  }

  res.render("product/product_detail", {
    title: product.name,
    product: product,
    units: productUnits,
  });
});

// Display Product create form on GET.
exports.create_get = asyncHandler(async (req, res, next) => {
  const allInstruments = await Instrument.find().exec();

  res.render("product/product_form", {
    title: "Create Product",
    instruments: allInstruments,
  });
});

// Handle Instrument create form on POST.
exports.create_post = [
  // Validate and sanitize fields.
  body("name")
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Name must be specified.")
    .custom(async (value) => {
      const doc = await Product.findOne({ name: value });
      if (doc) {
        throw new Error("Product already exists");
      }
    })
    .escape(),
  body("description", "Product requires a proper description.")
    .trim()
    .isLength({ min: 3, max: 300 }),
  body("image")
    .optional({ checkFalsy: true })
    .trim()
    .isURL()
    .withMessage("Image must have valid URL or left empty."),
  body("instrument", "Instrument must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create Product object with escaped and trimmed data
    const product = new Product({
      name: req.body.name,
      description: req.body.description,
      image: req.body.image,
      instrument: req.body.instrument,
    });

    console.log(product.image);

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.

      // Get all instruments for form.
      const allInstruments = await Instrument.find().exec();

      res.render("product/product_form", {
        title: "Create Product",
        product: product,
        instruments: allInstruments,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid.
      // Add placeholder image
      if (!req.body.image) product.image = placeholderURL;

      // Save instrument.
      await product.save();
      // Redirect to new instrument record.
      res.redirect(product.url);
    }
  }),
];

// Display Product delete form on GET.
exports.delete_get = asyncHandler(async (req, res, next) => {
  // Get details of products and all its units(in parallel)
  const [product, productUnits] = await Promise.all([
    Product.findById(req.params.id).exec(),
    Unit.find({ product: req.params.id }).exec(),
  ]);

  console.log(productUnits);

  if (product === null) {
    // No results.
    res.redirect("/instrument");
  }

  res.render("product/product_delete", {
    title: "Delete Product",
    product: product,
    units: productUnits,
  });
});

// Handle Product delete on POST.
exports.delete_post = asyncHandler(async (req, res, next) => {
  // Get details of product and all its units (in parallel)
  const [product, productUnits] = await Promise.all([
    Product.findById(req.params.id).exec(),
    Unit.find({ product: req.params.id }).exec(),
  ]);

  if (productUnits.length > 0) {
    // product has units. Render in same way as for GET route.
    res.render("product/product_delete", {
      title: "Delete Product",
      product: product,
      units: productUnits,
    });
    return;
  } else {
    // Product has no units. Delete object and redirect to the list of instruments.
    await Product.findByIdAndRemove(req.body.productid);
    res.redirect("/instrument");
  }
});

// Display Product update form on GET.
exports.update_get = asyncHandler(async (req, res, next) => {
  // Get product and instruments for form.
  const [product, allInstruments] = await Promise.all([
    Product.findById(req.params.id).exec(),
    Instrument.find().exec(),
  ]);

  if (product === null) {
    // No results.
    const err = new Error("Product not found");
    err.status = 404;
    return next(err);
  }
  res.render("product/product_form", {
    title: "Update Product",
    product: product,
    instruments: allInstruments,
  });
});

// Handle Product update on POST.
exports.update_post = [
  // Validate and sanitize fields.
  body("name")
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Name must be specified.")
    .custom(async (value, { req }) => {
      const doc = await Product.findOne({
        name: value,
        // make sure to exclude original document when searching for duplicate
        _id: { $ne: req.params.id },
      });
      if (doc) {
        throw new Error("Product already exists");
      }
    })
    .escape(),
  body("description", "Product requires a proper description.")
    .trim()
    .isLength({ min: 3, max: 300 }),
  body("image")
    .optional({ checkFalsy: true })
    .trim()
    .isURL()
    .withMessage("Image must have valid URL or left empty."),
  body("instrument", "Instrument must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create Product object with escaped/trimmed data and old id.
    const product = new Product({
      name: req.body.name,
      description: req.body.description,
      image: req.body.image,
      instrument: req.body.instrument,
      _id: req.params.id, // This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get families for form.
      const allInstruments = await Instrument.find().exec();

      res.render("product/product_form", {
        title: "Update Product",
        product: product,
        instruments: allInstruments,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid. Update the record.

      // Add placeholder image
      if (!req.body.image) product.image = placeholderURL;

      // Update the record.
      const theproduct = await Product.findByIdAndUpdate(
        req.params.id,
        product,
        {}
      );
      // Redirect to book detail page.
      res.redirect(theproduct.url);
    }
  }),
];
