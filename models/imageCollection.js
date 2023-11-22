const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  path: String,
});

const imageModel = mongoose.model("images", imageSchema);

module.exports = imageModel;
