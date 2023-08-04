let express = require("express");
let router = express.Router();
require("dotenv").config();
const basicAuth = require("express-basic-auth");
const product_controller = require("../controllers/productController");
const { FORM_USER, FORM_PASS } = process.env;

// GET list of products
router.get("/", product_controller.list);

// GET request for creating a Product. NOTE This must come before routes that display Product (uses id).
router.get("/create", product_controller.create_get);

// POST request for creating Product.
router.post("/create", product_controller.create_post);

// GET request for one Product.
router.get("/:id", product_controller.detail);

router.use(
  basicAuth({
    users: { [FORM_USER]: FORM_PASS },
    challenge: true,
    unauthorizedResponse: "Not authorised",
  })
);

// GET request to delete Product.
router.get("/:id/delete", product_controller.delete_get);

// POST request to delete Product.
router.post("/:id/delete", product_controller.delete_post);

// GET request to update Product.
router.get("/:id/update", product_controller.update_get);

// POST request to update Product.
router.post("/:id/update", product_controller.update_post);

module.exports = router;
