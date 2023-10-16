const mongoose = require("mongoose");

const additionalInfoSchema = new mongoose.Schema({});

const additionalInfoModel = mongoose.model(
  "additionalinfos",
  additionalInfoSchema
);

module.exports = additionalInfoModel;
