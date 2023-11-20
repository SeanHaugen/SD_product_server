const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  path: String,
});

const imageModel = mongoose.model("images", imageSchema);

module.exports = imageModel;
