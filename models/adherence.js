const mongoose = require("mongoose");

const adherenceSchema = new mongoose.Schema({
  NAME: String,
  CALL_EXPERIENCE: Number,
  ADHERENCE_PERCENTAGE: String,
  SF_CALL_LOG_PERCENTAGE: String,
  CALLS: Number,
  AHT: String,
  CHATS: Number,
});

const adherenceModel = mongoose.model("adherenceReports", adherenceSchema);

module.exports = adherenceModel;
