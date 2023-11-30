const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
  page: { type: String, required: true },
  content: { type: String, required: true },
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  note: [noteSchema],
});

const UserModel = mongoose.model("users", userSchema);

module.exports = UserModel;
