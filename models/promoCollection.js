const mongoose = require("mongoose");

// Define a schema for your collection
const promoItemSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  Item_Number: Number,
  Name: String,
  Category: String,
  SubCategory: String,
  Page: Number,
  Description: String,
  Keywords: String,
  Colors: String,
  Product_Width_inches: String,
  Product_Height_Inches: String,
  Produce_Depth_Inches: String,
  Pricing_Group: String,
  Qty1: Number,
  Prc1: Number,
  Qty2: Number,
  Prc2: Number,
  Qty3: Number,
  Prc3: Number,
  Qty4: Number,
  Prc4: Number,
  Qty5: Number,
  Prc5: Number,
  Qty6: Number,
  Prc6: Number,
  SetupChg: Number,
  Artwork_Required: String,
  Prop65_Status: String,
  FR_Rating: String,
  ANSI_BIFMA: String,
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
