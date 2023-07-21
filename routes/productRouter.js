let express = require("express");
let router = express.Router();
const product_controller = require("../controllers/productController");

// GET list of products
router.get("/", product_controller.list);

// GET request for creating a Product. NOTE This must come before routes that display Product (uses id).
router.get("/create", product_controller.create_get);

// POST request for creating Product.
router.post("/create", product_controller.create_post);

// GET request to delete Product.
router.get("/:id/delete", product_controller.delete_get);

// POST request to delete Product.
router.post("/:id/delete", product_controller.delete_post);

// GET request to update Product.
router.get("/:id/update", product_controller.update_get);

// POST request to update Product.
router.post("/:id/update", product_controller.update_post);

// GET request for one Product.
router.get("/:id", product_controller.detail);

module.exports = router;
