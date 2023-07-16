let express = require("express");
let router = express.Router();
const family_controller = require("../controllers/familyController");

/// FAMILY ROUTES ///

// GET list of instrument families
router.get("/", family_controller.list);

// // GET request for creating a Family. NOTE This must come before routes that display Family (uses id).
// router.get("/create", family_controller.family_create_get);

// // POST request for creating Family.
// router.post("/create", family_controller.family_create_post);

// // GET request to delete Family.
// router.get("/:id/delete", family_controller.family_delete_get);

// // POST request to delete Family.
// router.post("/:id/delete", family_controller.family_delete_post);

// // GET request to update Family.
// router.get("/:id/update", family_controller.family_update_get);

// // POST request to update Family.
// router.post("/:id/update", family_controller.family_update_post);

// // GET request for one Family.
// router.get("/:id", family_controller.family_detail);

module.exports = router;
