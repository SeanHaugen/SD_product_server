const mongoose = require("mongoose");

const flatRateSchema = new mongoose.Schema({
  Item_Number: Number,
  Service: String,
  Rate: Number,
});

const flatRateModel = mongoose.model("flatrateshippings", flatRateSchema);

module.exports = flatRateModel;
