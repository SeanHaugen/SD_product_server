const mongoose = require("mongoose");

const eurofitSchema = new mongoose.Schema({
  Measurements: String,
  Name: String,
  Item_Number: Number,
  Additional_Information: String,
});

const EurofitModel = mongoose.model("Eurofits", eurofitSchema);

module.exports = EurofitModel;
