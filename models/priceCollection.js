const mongoose = require("mongoose");

//Pricing

const PricingSchema = new mongoose.Schema({
  url: String,
  Name: String,
  Item_Number: String,
  Promo: Boolean,
  Pricing: [
    [String, String, String, String, String],
    [String, String, String, String, String],
  ],
});

const PricingModel = mongoose.model("itempricing", PricingSchema);

module.exports = PricingModel;
