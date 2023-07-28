// get URL values from Mongoose doc and count children for each object
const getChildrenAndUrls = async (parentArray, model, key) => {
  let newArray = [];
  if (parentArray) {
    for (let doc of parentArray) {
      let obj = doc.toObject();

      let children = await model
        .find({
          [key]: obj._id,
        })
        .exec();
      obj.children = children.length;

      obj.url = doc.url;

      if (doc.family) {
        obj.family = doc.family.name;
      }

      if (doc.instrument) {
        obj.instrument = doc.instrument.name;
      }

      newArray.push(obj);
    }
    return newArray;
  }
};

module.exports = { getChildrenAndUrls };
