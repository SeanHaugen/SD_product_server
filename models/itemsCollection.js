const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  Item_Number: Number,
  // Item_Number: mongoose.Schema.Types.Mixed,
  Name: String,
  Category: String,
  SubCategory: String,
  Description: String,
  Keywords: String,
  Colors: String,
  Product_Width_inches: String,
  Product_Height_Inches: String,
  Produce_Depth_Inches: String,
  Pricing_Group: String,
  SetupChg: Number,
  Artwork_Required: String,
  Prop65_Status: String,
  FR_Rating: String,
  Package_Size: String,
  Package_Weight: String,
  Product_Weight: String,
  Kit_Includes: String,
  Materials: String,
  Imprint_Method: String,
  Lead_Times: Number,
  Origin: String,
  Warranty: String,
  Product_Status: String,
  additional_info: Array,
  OOS: Boolean,
  Low_Stock: Boolean,
  Date: Date,
  Alt: Array,
  Promo: Boolean,
  RelatedItems: String,
  New_Item: Boolean,
  Outdoor: Boolean,
});

const itemsModel = mongoose.model("items", itemSchema);

module.exports = itemsModel;
