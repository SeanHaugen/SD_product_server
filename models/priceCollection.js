const PricingSchema = new mongoose.Schema({
  url: String,
  Name: String,
  Item_Number: String,
  Promo: Boolean,
  Pricing_Table: [
    [mongoose.Schema.Types.Mixed], // Use mongoose.Schema.Types.Mixed for the inner arrays
    [mongoose.Schema.Types.Mixed],
  ],
});
