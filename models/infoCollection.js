const mongoose = require("mongoose");

const InfoSchema = new mongoose.Schema({
  url: String,
  Name: String,
  Item_Number: String,
  Pricing: [String],
});

const InfoModel = mongoose.model("internalinfos", InfoSchema);

module.exports = InfoModel;
