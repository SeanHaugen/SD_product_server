const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const itemsModel = require("./models/itemsCollection");
const PricingModel = require("./models/priceCollection");
const EurofitModel = require("./models/eurofitCollection");
const flatRateModel = require("./models/flatRateCollection");
const InfoModel = require("./models/infoCollection");
const mediaModel = require("./models/mediaCollection");
const promoItemModel = require("./models/promoCollection");
const additionalInfoModel = require("./models/additionalInfoCollection");

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

//Get Internal Information
app.get("/info", async (req, res) => {
  try {
    const itemInfo = req.query.item;
    const info = await InfoModel.findOne({
      Item_Number: itemInfo.trim(),
    });
    console.log(info);

    if (!info) {
      return res.status(404).json({ message: "Internal Info not found" });
    }

    res.json(info);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

//get flatrates
app.get("/flatRates/:item", async (req, res) => {
  try {
    const flatRateItem = req.params.item;
    const rateInfo = await flatRateModel.find({
      Item_Number: flatRateItem,
      Service: { $in: ["GROUND SERVICE", "2DAY", "STANDARD OVERNIGHT"] },
    });
    console.log(rateInfo);
    if (rateInfo.length === 0) {
      return res.status(404).json({ message: "Internal Info not found" });
    }
    res.json(rateInfo);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

//get Eurofit info
app.get("/eurofits", async (req, res) => {
  try {
    const itemNumber = parseInt(req.query.item);

    if (isNaN(itemNumber)) {
      return res.status(400).json({ message: "Invalid Item_Number provided" });
    }

    const info = await EurofitModel.findOne({
      Item_Number: itemNumber,
    });

    if (!info) {
      return res.status(404).json({ message: "Eurofit Info not found!" });
    }

    console.log("Query:", info);

    res.json(info);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

//get media info Specifications
app.get("/mediaspecs", async (req, res) => {
  try {
    const media = req.query.item;
    const mediaInfo = await mediaModel.find({
      Type: media,
    });
    console.log(mediaInfo);
    res.json(mediaInfo);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/promo-items", async (req, res) => {
  try {
    const promoItems = await promoItemModel.find({});
    console.log(promoItems); // Add this line to log the results
    res.json(promoItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

//PUT request

app.put("/update/:itemNumber", async (req, res) => {
  console.log("Received PUT request:", req.body);
  const itemNumber = req.params.itemNumber;

  try {
    // Find the item by its Item_Number
    let itemToUpdate = await items.findOne({ Item_Number: itemNumber });

    if (!itemToUpdate) {
      return res.status(404).json({ message: "Item not found" });
    }

    // if ("Name" in req.body) itemToUpdate.Name = req.body.Name;
    // if ("Category" in req.body) itemToUpdate.Category = req.body.Category;
    // if ("SubCategory" in req.body)
    //   itemToUpdate.SubCategory = req.body.SubCategory;
    if ("Description" in req.body)
      itemToUpdate.Description += " " + req.body.Description;
    if ("Materials" in req.body)
      itemToUpdate.Materials += " " + req.body.Materials;
    if ("Package_Weight" in req.body)
      itemToUpdate.Package_Weight += " " + req.body.Package_Weight;
    if ("Imprint_Method" in req.body)
      itemToUpdate.Imprint_Method += " " + req.body.Imprint_Method;
    if ("Imprint_Method" in req.body)
      itemToUpdate.Imprint_Method += " " + req.body.Imprint_Method;

    await itemToUpdate.save();

    return res.status(200).json({ message: "Item updated successfully" });
  } catch (error) {
    console.error("Error updating item:", error);

    return res
      .status(500)
      .json({ message: "Error updating item", error: error.message });
  }
});

app.put("/update/pricing/:itemNumber", async (req, res) => {
  try {
    const itemNumber = req.params.itemNumber;
    // const elementIndex = req.body.elementIndex; // The index of the element you want to update
    // const updatedElement = req.body.updatedElement; // The new element data
    const outerIndex = req.body.outerIndex; // The index of the outer array
    const innerIndex = req.body.innerIndex; // The index of the inner sub-array
    const updatedElement = req.body.updatedElement;

    const filter = { Item_Number: itemNumber };
    const update = {
      $set: {
        [`Pricing.${outerIndex}.${innerIndex}`]: updatedElement,
      },
    };

    await PricingModel.updateOne(filter, update);
    console.log("pricing updated successfully");
    res.sendStatus(200);
  } catch (error) {
    console.error("Error updating item", error);
    res
      .status(500)
      .json({ message: "Could not update item", error: error.message });
  }
});

//POST request

app.post("/additionalInfo/:item", async (req, res) => {
  try {
    const itemNumber = req.params.item;
    const newAdditionalInfo = req.body;

    const newDocument = new additionalInfoModel({
      item: itemNumber,
      additionalInfo: newAdditionalInfo, // Corrected the property name
    });
    newDocument.save();
  } catch (error) {
    console.error("error adding document", error);
    res
      .status(500)
      .json({ message: "could not add document", error: error.message });
  }
});

app.post("/add/promo-items", async (req, res) => {
  try {
    const newItemData = req.body; // This should contain the selected item data
    const newPromoItem = new promoItemModel(newItemData);
    await newPromoItem.save();
    console.log(newPromoItem);
    res.status(201).json(newPromoItem);
  } catch (error) {
    console.error("Error adding promo item:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/add", async (req, res) => {
  try {
    const { Item_Number, Name, Description, Keywords, Category, SubCategory } =
      req.body;

    // Validate input data (you can add more validation logic here)
    if (!Item_Number || !Name || !Category) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const newItem = new items({
      Item_Number,
      Name,
      Description,
      Keywords,
      Category,
      SubCategory,
      Colors,
      Product_Width_inches,
      Product_Height_Inches,
      Produce_Depth_Inches,
      Artwork_Required,
      Package_Size,
      Package_Weight,
      Product_Weight,
      Kit_Includes,
      Materials,
      Imprint_Method,
      Origin,
    });

    await newItem.save();
    res.status(201).json({ message: "Item added successfully" });
  } catch (error) {
    console.error("Error adding item:", error);
    res
      .status(500)
      .json({ message: "Error adding item", error: error.message });
  }
});

app.post("/pricingAdd", async (req, res) => {
  try {
    console.log("Received request body:", req.body);
    const { Item_Number, Name, Pricing } = req.body;
    // Check if an item with the given Item_Number already exists
    let existingItem = await PricingModel.findOne({ Item_Number });

    if (existingItem) {
      return res.status(400).json({ message: "Item already exists" });
    }

    // Create a new item document
    const newItem = new PricingModel({
      Item_Number,
      Name,
      Pricing: Pricing.map((entry) => ({
        label: entry.label,
        prices: entry.prices,
      })),
    });

    // Save the new item to the database
    await newItem.save();

    console.log("Item pricing added successfully");
    res.status(201).json({ message: "Item pricing added successfully" });
  } catch (error) {
    console.error("Error adding item pricing:", error);
    res
      .status(500)
      .json({ message: "Error adding item pricing", error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
