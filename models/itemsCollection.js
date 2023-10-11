const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  Item_Number: Number,
  Name: String,
  Category: String,
  SubCategory: String,
  Description: String,
  Keywords: String,
});

const itemsModel = mongoose.model("items", itemSchema);

module.exports = itemsModel;
