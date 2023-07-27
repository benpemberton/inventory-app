let express = require("express");
let router = express.Router();
const family_controller = require("../controllers/familyController");

// GET request for one Family.
router.get("/:id", family_controller.detail);

module.exports = router;
