const Family = require("../models/family");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

// Display list of all Families.
exports.list = asyncHandler(async (req, res, next) => {
  const allFamilies = await Family.find().sort({ name: 1 }).exec();
  res.render("family/list", {
    title: "Family List",
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
  body("description")
    .trim()
    .isLength({ min: 3, max: 200 })
    .escape()
    .withMessage("Description must be specified.")
    .isAlphanumeric()
    .withMessage("Description has non-alphanumeric characters."),

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

// Display Author delete form on GET.
exports.author_delete_get = asyncHandler(async (req, res, next) => {
  // Get details of author and all their books (in parallel)
  const [author, allBooksByAuthor] = await Promise.all([
    Author.findById(req.params.id).exec(),
    Book.find({ author: req.params.id }, "title summary").exec(),
  ]);

  if (author === null) {
    // No results.
    res.redirect("/catalog/authors");
  }

  res.render("author_delete", {
    title: "Delete Author",
    author: author,
    author_books: allBooksByAuthor,
  });
});

// Handle Author delete on POST.
exports.author_delete_post = asyncHandler(async (req, res, next) => {
  // Get details of author and all their books (in parallel)
  const [author, allBooksByAuthor] = await Promise.all([
    Author.findById(req.params.id).exec(),
    Book.find({ author: req.params.id }, "title summary").exec(),
  ]);

  if (allBooksByAuthor.length > 0) {
    // Author has books. Render in same way as for GET route.
    res.render("author_delete", {
      title: "Delete Author",
      author: author,
      author_books: allBooksByAuthor,
    });
    return;
  } else {
    // Author has no books. Delete object and redirect to the list of authors.
    await Author.findByIdAndRemove(req.body.authorid);
    res.redirect("/catalog/authors");
  }
});

// Display Author update form on GET.
exports.author_update_get = asyncHandler(async (req, res, next) => {
  // Get author for form.
  const author = await Author.findById(req.params.id).exec();

  if (author === null) {
    // No results.
    const err = new Error("Author not found");
    err.status = 404;
    return next(err);
  }
  res.render("author_form", {
    title: "Update Author",
    author: author,
  });
});

// Handle Author update on POST.
exports.author_update_post = [
  // Validate and sanitize fields.
  body("first_name", "First name must not be empty.")
    .trim()
    .isLength({ min: 1, max: 100 })
    .escape(),
  body("family_name", "Last name must not be empty.")
    .trim()
    .isLength({ min: 1, max: 100 })
    .escape(),
  body("date_of_birth", "Invalid date")
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate(),
  body("date_of_birth", "Invalid date")
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Book object with escaped/trimmed data and old id.
    const author = new Author({
      first_name: req.body.first_name,
      family_name: req.body.family_name,
      date_of_birth: req.body.date_of_birth,
      date_of_death: req.body.date_of_death,
      _id: req.params.id, // This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.
      res.render("author_form", {
        title: "Update Author",
        author: author,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid. Update the record.
      const theauthor = await Author.findByIdAndUpdate(
        req.params.id,
        author,
        {}
      );
      // Redirect to book detail page.
      res.redirect(theauthor.url);
    }
  }),
];
