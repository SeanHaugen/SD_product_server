const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const itemsModel = require("./models/itemsCollection");
const PricingModel = require("./models/priceCollection");

DATABASE_PASSWORD = "DkD0ml96WSM62TAn";
DATABASE = `mongodb+srv://seanhaugen560:${DATABASE_PASSWORD}@cluster0.adhrbht.mongodb.net/products?retryWrites=true&w=majority`;

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

mongoose.connect(DATABASE, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", (error) => console.error(`MongoDB connection error: ${error}`));
db.once("open", () => console.log("Connected to MongoDB"));

//Get the basic item collections

// Root route
app.get("/", (req, res) => {
  res.send("Hello, world!");
});

// Get unique categories
app.get("/category", async (req, res) => {
  try {
    const allCategories = await itemsModel.distinct("Category");
    console.log("Categories:", allCategories); // Add this line to log the results
    res.json(allCategories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

//Get the item category
app.get("/category/:category", async (req, res) => {
  try {
    const productCategory = req.params.category.replace(/"/g, "");
    const result = await itemsModel.aggregate([
      { $match: { Category: productCategory } },
      { $group: { _id: "$SubCategory" } },
      { $sort: { _id: 1 } },
    ]);
    const subcategories = result.map((item) => item._id);
    res.send(subcategories);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error!");
  }
});

//Get the subcategory
app.get("/SubCategory", async (req, res) => {
  const allItems = await itemsModel.distinct("SubCategory");
  res.send(allItems);
});

//get the item
app.get("/subCategory/:items", async (req, res) => {
  const productCategory = req.params.items;

  try {
    const products = await itemsModel
      .find({ SubCategory: productCategory })
      .sort({ Name: 1 });
    res.send(products);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

//Get items through Search
app.get("/items", async (req, res) => {
  const itemNumber = req.query.item;
  try {
    const item = await itemsModel.findOne({ Item_Number: itemNumber });
    res.send(item);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/search", async (req, res) => {
  const searchQuery = req.query.q;

  try {
    const numericQuery = parseFloat(searchQuery);
    let results;

    if (!isNaN(numericQuery)) {
      results = await itemsModel.find({ Item_Number: numericQuery });
    } else {
      results = await itemsModel
        .find(
          {
            $text: { $search: searchQuery },
          },
          {
            score: { $meta: "textScore" },
          }
        )
        .sort({ score: { $meta: "textScore" } });
    }
    res.json(results);
  } catch (error) {
    console.log("Error searching database");
    res
      .status(500)
      .json({ error: "An error occurred while searching the database." });
  }
});

app.get("/pricing/:criteria/:item", async (req, res) => {
  try {
    const criteria = req.params.criteria;
    const itemValue = req.params.item;
    let query = {};

    // Define the query based on the criteria
    if (criteria === "item_number") {
      query.Item_Number = itemValue.trim();
    } else if (criteria === "name") {
      query.Name = itemValue.trim();
    } else if (criteria === "url") {
      query.url = itemValue.trim();
    } else {
      return res.status(400).json({ message: "Invalid search criteria" });
    }

    const pricingDoc = await PricingModel.findOne(query);
    // const pricingDoc = await PricingModel.findOne({
    //   Item_Number: pricingItem.trim(), // Trim whitespace including newlines
    // });

    if (!pricingDoc) {
      return res.status(404).json({ message: "Pricing not found" });
    }

    const pricingArrays = pricingDoc.Pricing; // Extract the Pricing arrays

    res.json(pricingArrays);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
