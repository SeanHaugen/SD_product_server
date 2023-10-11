const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  itemNumbers: {
    type: [String],
    required: false,
  },
  inkCompatibility: {
    type: String,
    required: false,
  },
  content: {
    type: String,
    required: false,
  },
  surface: {
    type: String,
    required: false,
  },
  scrimConstruction: {
    type: String,
    required: false,
  },
  thickness: {
    type: String,
    required: false,
  },
  weight: {
    type: String,
    required: false,
  },
  coldCrack: {
    type: String,
    required: false,
  },
  tensileStrength: {
    type: String,
    required: false,
  },
  tearStrength: {
    type: String,
    required: false,
  },
  rollLength: {
    type: String,
    required: false,
  },
  core: {
    type: String,
    required: false,
  },
  packaging: {
    type: String,
    required: false,
  },
  countryOfOrigin: {
    type: String,
    required: false,
  },
  flameResistance: {
    type: String,
    required: false,
  },
  applications: {
    type: String,
    required: false,
  },
  storage: {
    type: String,
    required: false,
  },
  prop65: {
    type: String,
    required: false,
  },
  type: {
    type: String,
    required: true,
  },
});

const mediaModel = mongoose.model("mediaspecs", mediaSchema);

module.exports = mediaModel;
