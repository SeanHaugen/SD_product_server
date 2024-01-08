const mongoose = require("mongoose");

//Pricing

const PricingSchema = new mongoose.Schema({
  url: String,
  Name: String,
  Item_Number: String,
  Promo: Boolean,
  Pricing: [
    mongoose.Schema.Types.Mixed, // Use mongoose.Schema.Types.Mixed for the inner arrays
    mongoose.Schema.Types.Mixed,
  ],
});

const PricingModel = mongoose.model("itempricing", PricingSchema);

module.exports = PricingModel;
