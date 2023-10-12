const mongoose = require("mongoose");

// Define a schema for your collection
const promoItemSchema = new mongoose.Schema({
  Item_Number: Number,
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
});

// Create a model based on the schema
const promoItemModel = mongoose.model("promoitems", promoItemSchema);

module.exports = promoItemModel;
