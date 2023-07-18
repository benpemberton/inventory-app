const Family = require("../models/family");
const Instrument = require("../models/instrument");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

// Display list of all Families.
exports.list = asyncHandler(async (req, res, next) => {
  const allFamilies = await Family.find().sort({ name: 1 }).exec();
  res.render("family/list", {
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

  res.render("family/detail", {
    title: "Family Detail",
    family: family,
    instruments: instrumentsInFamily,
  });
});

// Display Family create form on GET.
exports.create_get = (req, res, next) => {
  res.render("family/form", { title: "Create Family" });
};

// Handle Family create form on POST.
exports.create_post = [
  // Validate and sanitize fields.
  body("name")
    .trim()
    .isLength({ min: 3, max: 100 })
    .escape()
    .withMessage("Name must be specified.")
    .isAlphanumeric()
    .withMessage("Name has non-alphanumeric characters."),
  body("description", "Family requires a proper description.")
    .trim()
    .isLength({ min: 3, max: 200 })
    .escape(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create Author object with escaped and trimmed data
    const family = new Family({
      name: req.body.name,
      description: req.body.description,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      res.render("family/form", {
        title: "Create Family",
        family: family,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid.

      // Save family.
      await family.save();
      // Redirect to new author record.
      res.redirect(family.url);
    }
  }),
];

// Display Family delete form on GET.
exports.delete_get = asyncHandler(async (req, res, next) => {
  // Get details of family and all its instruments (in parallel)
  const [family, instrumentsInFamily] = await Promise.all([
    Family.findById(req.params.id).exec(),
    Instrument.find({ family: req.params.id }, "name description").exec(),
  ]);

  if (family === null) {
    // No results.
    res.redirect("/family");
  }

  res.render("family/delete", {
    title: "Delete Family",
    family: family,
    instruments: instrumentsInFamily,
  });
});

// Handle Author delete on POST.
exports.delete_post = asyncHandler(async (req, res, next) => {
  // Get details of family and all its instruments (in parallel)
  const [family, instrumentsInFamily] = await Promise.all([
    Family.findById(req.params.id).exec(),
    Instrument.find({ family: req.params.id }, "name description").exec(),
  ]);

  if (instrumentsInFamily.length > 0) {
    // Family has instruments. Render in same way as for GET route.
    res.render("family/delete", {
      title: "Delete Family",
      family: family,
      instruments: instrumentsInFamily,
    });
    return;
  } else {
    // Family has no instruments. Delete object and redirect to the list of families.
    await Family.findByIdAndRemove(req.body.familyid);
    res.redirect("/family");
  }
});

// Display Family update form on GET.
exports.update_get = asyncHandler(async (req, res, next) => {
  // Get family for form.
  const family = await Family.findById(req.params.id).exec();

  if (family === null) {
    // No results.
    const err = new Error("Family not found");
    err.status = 404;
    return next(err);
  }
  res.render("family/form", {
    title: "Update Family",
    family: family,
  });
});

// Handle Author update on POST.
exports.update_post = [
  // Validate and sanitize fields.
  body("name")
    .trim()
    .isLength({ min: 3, max: 100 })
    .escape()
    .withMessage("Name must be specified.")
    .isAlphanumeric()
    .withMessage("Name has non-alphanumeric characters."),
  body("description", "Family requires a proper description.")
    .trim()
    .isLength({ min: 3, max: 200 })
    .escape(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Family object with escaped/trimmed data and old id.
    const family = new Family({
      name: req.body.name,
      description: req.body.description,
      _id: req.params.id, // This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.
      res.render("family/form", {
        title: "Update Family",
        family: family,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid. Update the record.
      const thefamily = await Family.findByIdAndUpdate(
        req.params.id,
        family,
        {}
      );
      // Redirect to book detail page.
      res.redirect(thefamily.url);
    }
  }),
];
