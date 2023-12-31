let express = require("express");
let router = express.Router();
require("dotenv").config();
const basicAuth = require("express-basic-auth");
const instrument_controller = require("../controllers/instrumentController");
const { FORM_USER, FORM_PASS } = process.env;

// GET list of instrument instruments
router.get("/", instrument_controller.list);

// GET request for creating a Instrument. NOTE This must come before routes that display Instrument (uses id).
router.get("/create", instrument_controller.create_get);

// POST request for creating Instrument.
router.post("/create", instrument_controller.create_post);

// GET request for one Instrument.
router.get("/:id", instrument_controller.detail);

router.use(
  basicAuth({
    users: { [FORM_USER]: FORM_PASS },
    challenge: true,
    unauthorizedResponse: "Not authorised",
  })
);

// GET request to delete Instrument.
router.get("/:id/delete", instrument_controller.delete_get);

// POST request to delete Instrument.
router.post("/:id/delete", instrument_controller.delete_post);

// GET request to update Instrument.
router.get("/:id/update", instrument_controller.update_get);

// POST request to update Instrument.
router.post("/:id/update", instrument_controller.update_post);

module.exports = router;
