const Family = require("../models/family");
const Instrument = require("../models/instrument");
const asyncHandler = require("express-async-handler");

// Display list of all Families.
exports.family_list = asyncHandler(async (req, res, next) => {
  const allFamilies = await Family.find().sort({ name: 1 }).exec();

  let newArray = [];

  // get URL values from Mongoose doc and count instruments for each family
  const getInstrumentsAndUrls = async () => {
    if (allFamilies) {
      for (let family of allFamilies) {
        let obj = family.toObject();
        obj.url = family.url;
        let instruments = await Instrument.find({
          family: obj._id,
        }).exec();
        obj.instruments = instruments.length;
        newArray.push(obj);
      }
    }
  };

  await getInstrumentsAndUrls();

  res.render("index", {
    title: "Families",
    family_list: newArray,
  });
});
