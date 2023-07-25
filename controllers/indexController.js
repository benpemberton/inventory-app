const Family = require("../models/family");
const Instrument = require("../models/instrument");

const asyncHandler = require("express-async-handler");

// Display list of all Families.
exports.family_list = asyncHandler(async (req, res, next) => {
  const allFamilies = await Family.find().sort({ name: 1 }).exec();

  let familyObjs = [];

  const getNumInstruments = async () => {
    if (allFamilies) {
      for (const obj of allFamilies) {
        let newObj = obj;
        let array = await Instrument.find({ family: obj._id }).exec();
        newObj.instruments = array.length;
        familyObjs.push(newObj);
        console.log(familyObjs);
      }
    }
  }

  getNumInstruments();
  
  
  res.render("index", {
    title: "Families",
    family_list: allFamilies,
  });
});