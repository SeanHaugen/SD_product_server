const mongoose = require("mongoose");

//Pricing

const PricingSchema = new mongoose.Schema({
  // url: String,
  // Name: String,
  // Item_Number: String,
  // Promo: Boolean,
  // Pricing: [
  //   [String, String, String, String, String],
  //   [String, String, String, String, String],
  // ],

  url: String,
  Name: String,
  Item_Number: String,
  Internal_Info: String,
  Pricing: [
    {
      type: {
        type: String,
        enum: ["Retail", "Net", "CPP1CS", "KEY2CS", "INP3CS"],
      },
      prices: [String],
    },
  ],
});

const PricingModel = mongoose.model("itempricing", PricingSchema);

module.exports = PricingModel;
