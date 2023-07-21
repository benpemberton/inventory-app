let express = require("express");
let router = express.Router();
const unit_controller = require("../controllers/unitController");

// // GET list of units
// router.get("/", unit_controller.list);

// NOTE This must come before routes that display unit (uses id).
router.get("/create", unit_controller.create_get);

router.post("/create", unit_controller.create_post);

router.get("/:id/delete", unit_controller.delete_get);

router.post("/:id/delete", unit_controller.delete_post);

router.get("/:id/update", unit_controller.update_get);

router.post("/:id/update", unit_controller.update_post);

router.get("/:id", unit_controller.detail);

module.exports = router;
