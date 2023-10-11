const express = require("express");
const router = express.Router();

const itemsModel = require("../models/itemsCollection");

//Get the basic item collections

router.get("/", (req, res) => {
  res.send("hello world");
});

router.get("/category", async (req, res) => {
  res.send("hello get request");
  try {
    const allCategories = await itemsModel.distinct("category");
    res.json(allCategories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
