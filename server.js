//dependencies import
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

//Model Imports
const itemsModel = require("./models/itemsCollection");
const PricingModel = require("./models/priceCollection");
const mediaModel = require("./models/mediaCollection");
const promoItemModel = require("./models/promoCollection");

//controller imports
const {
  register,
  login,
  protected,
} = require("./controllers/login/authController");

const {
  getDashboardData,
} = require("./controllers/dashboard/dashboardController");

const {
  postUserNotes,
  getUserNotes,
  putUserNotes,
  deleteUserNotes,
} = require("./controllers/userControl/userNotesControllers");

const {
  getSubcategoryItems,
  getSubCategory,
  getItemCategory,
  getCategory,
} = require("./controllers/products/productCategoryController");

const { getItemData } = require("./controllers/itemInfo/itemDataController");

const {
  getSearchResults,
} = require("./controllers/itemInfo/itemSearchController");

const {
  getItemPricing,
} = require("./controllers/itemInfo/itemPricingController");

const {
  getAdditionalInfo,
} = require("./controllers/itemInfo/additionalInfoController");

const {
  getFlatRate,
} = require("./controllers/itemInfo/itemFlatRateController");

const {
  getEurofitInfo,
} = require("./controllers/itemInfo/eurofitItemController");

const {
  getMediaSpecs,
  getSpecsForMedia,
} = require("./controllers/itemInfo/mediaSpecsController");

const {
  getSimilarItems,
} = require("./controllers/itemInfo/similarItemsController");

//initialize as express application
const app = express();
const port = process.env.PORT || 3000;

// First database connection for products
const productDBPassword = "DkD0ml96WSM62TAn";
const productDatabase = `mongodb+srv://seanhaugen560:${productDBPassword}@cluster0.adhrbht.mongodb.net/products`;

// Second database connection for dashboard
const dashboardDBPassword = "DkD0ml96WSM62TAn";
const dashboardDatabase = `mongodb+srv://seanhaugen560:${dashboardDBPassword}@cluster0.adhrbht.mongodb.net/dashboard`;

//initialize cors and express
app.use(cors());
app.use(express.json());

// Connect to the products database
mongoose.connect(productDatabase, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: "products",
});

const productDB = mongoose.connection;
productDB.on("error", (error) =>
  console.error(`Products MongoDB connection error: ${error}`)
);
productDB.once("open", () => console.log("Connected to Products MongoDB"));

// Connect to the dashboard database
mongoose.createConnection(dashboardDatabase, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: "dashboard", // Specify the database name here
});

const dashboardDB = mongoose.connection;
dashboardDB.on("error", (error) =>
  console.error(`Dashboard MongoDB connection error: ${error}`)
);

app.post("/login", login);
app.post("/register", register);
app.get("/protected", protected);

//Allow users to take notes
app.post("/notes/:username", postUserNotes);
app.get("/notes/:username", getUserNotes);
app.put("/notes/:userId/:currentPage", putUserNotes);
app.delete("/notes/:username", deleteUserNotes);

app.get("/dashboardData", getDashboardData);
//Get requests from the ItemsCollections
app.get("/category", getCategory);
//Get the item category
app.get("/category/:category", getItemCategory);
//Get the subcategory
app.get("/SubCategory", getSubCategory);
//get the item
app.get("/subCategory/:items", getSubcategoryItems);
//Get items through Search
app.get("/search", getSearchResults);

//Below will get all the relevant item data
//Gets all the base data for an individual item
app.get("/items", getItemData);
app.get("/pricing/:criteria/:item", getItemPricing);
app.get("/info", getAdditionalInfo);
app.get("/flatRates/:item", getFlatRate);
app.get("/eurofits", getEurofitInfo);
//get media info Specifications
app.get("/mediaspecs", getMediaSpecs);
app.get("/specsForMedia", getSpecsForMedia);
//Get similar products from items collection
app.get("/document/:pattern", getSimilarItems);

//PUT request
//Edit the description of the item
app.put("/update/:itemNumber", async (req, res) => {
  try {
    const itemnum = req.params.itemNumber;
    const newDescription = req.body.newDescription;

    // Update the item with the new description
    const updatedItem = await itemsModel.findOneAndUpdate(
      { Item_Number: itemnum }, // Corrected line
      { $set: { Description: newDescription } },
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.json(updatedItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
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

//POST/PUT request for adding new information

app.post("/additionalInfo/:item", async (req, res) => {
  try {
    const itemNumber = req.params.item;
    const newAdditionalInfo = req.body.additional_info;

    const item = await itemsModel.findOne({ Item_Number: itemNumber });

    console.log("Item Number:", itemNumber);
    console.log("New Additional Info:", newAdditionalInfo);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Check if "additional_info" field exists in the item
    if (!item.additional_info) {
      // If it doesn't exist, create the field
      item.additional_info = newAdditionalInfo;
    } else {
      // If it exists, update the value
      item.additional_info = newAdditionalInfo;
    }

    // Save the updated document
    await item.save();
    res.status(200).json({ message: "Additional info added successfully" });
  } catch (error) {
    console.error("error adding document", error);
    res
      .status(500)
      .json({ message: "could not add document", error: error.message });
  }
});

app.put("/additionalInfoEdit/:item", async (req, res) => {
  try {
    const itemNumber = req.params.item;
    const newAdditionalInfo = req.body.additional_info;

    const item = await itemsModel.findOne({ Item_Number: itemNumber });

    console.log("Item Number:", itemNumber);
    console.log("New Additional Info:", newAdditionalInfo);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Check if "additional_info" field exists in the item
    if (!item.additional_info) {
      // If it doesn't exist, create the field with the new value
      item.additional_info = [newAdditionalInfo];
    } else {
      // If it exists, append the new value to the existing array
      item.additional_info.push(newAdditionalInfo);
    }

    // Save the updated document
    await item.save();
    res.status(200).json({ message: "Additional info updated successfully" });
  } catch (error) {
    console.error("Error updating document", error);
    res
      .status(500)
      .json({ message: "Could not update document", error: error.message });
  }
});

app.delete("/removeAdditionalInfo/:item", async (req, res) => {
  try {
    const itemNumber = req.params.item;
    const deleteIndex = req.query.index; // Query parameter to specify which piece of info to delete

    const item = await itemsModel.findOne({ Item_Number: itemNumber });

    console.log("Item Number:", itemNumber);
    console.log("Delete Index:", deleteIndex);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (!item.additional_info) {
      return res.status(400).json({ message: "No additional info to delete" });
    }

    // Split the additional info by a delimiter (e.g., newline) to create an array
    const additionalInfoArray = item.additional_info.split("\n");

    if (deleteIndex === undefined) {
      // If no index is specified, delete all additional info
      item.additional_info = null;
    } else {
      // Check if the specified index is valid
      if (deleteIndex >= 0 && deleteIndex < additionalInfoArray.length) {
        // Remove the specified piece of info by its index
        additionalInfoArray.splice(deleteIndex, 1);
        // Join the remaining info back into a string
        item.additional_info = additionalInfoArray.join("\n");
      } else {
        return res.status(400).json({ message: "Invalid index specified" });
      }
    }

    // Save the updated document
    await item.save();
    res.status(200).json({ message: "Additional info deleted successfully" });
  } catch (error) {
    console.error("Error deleting additional info", error);
    res.status(500).json({
      message: "Could not delete additional info",
      error: error.message,
    });
  }
});

/////////////////////////////////////////
//requests for New Items

app.get("/get-newItem", async (req, res) => {
  try {
    const newItem = await itemsModel.find({ New_Item: true });
    res.json(newItem);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.put("/toggle-newItem/:itemnum", async (req, res) => {
  try {
    const itemId = req.params.itemnum;
    const item = await itemsModel.findOne({ Item_Number: itemId });

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    item.New_Item = !item.New_Item;

    // Save the updated document
    const updatedItem = await item.save();

    return res.status(200).json(updatedItem);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

///Outdoor item requests
app.get("/get-outdoorItem", async (req, res) => {
  try {
    const outdoorItem = await itemsModel.find({ Outdoor: true });
    res.json(outdoorItem);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.put("/toggle-outdoorItem/:itemnum", async (req, res) => {
  try {
    const itemId = req.params.itemnum;
    const item = await itemsModel.findOne({ Item_Number: itemId });

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    item.Outdoor = !item.Outdoor;

    // Save the updated document
    const updatedItem = await item.save();

    return res.status(200).json(updatedItem);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

////////////////////////////////////////
//requests for OOS/low inventory

app.get("/items/oos", async (req, res) => {
  try {
    const oosItems = await itemsModel.find({ OOS: true });
    res.json(oosItems);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/items/lowStock", async (req, res) => {
  try {
    const oosItems = await itemsModel.find({ Low_Stock: true });
    res.json(oosItems);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/get-oos/:item_number", async (req, res) => {
  try {
    const itemNumber = req.params.item_number;

    // Find the item document with the specified Item_Number
    const item = await itemsModel.findOne({ Item_Number: itemNumber });

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Check if "OOS" field exists in the item
    const isOutOfStock = item.OOS || false;

    res.status(200).json({ OOS: isOutOfStock });
  } catch (error) {
    console.error("Error fetching out-of-stock status", error);
    res.status(500).json({
      message: "Could not fetch out-of-stock status",
      error: error.message,
    });
  }
});

app.get("/get-lowStock/:item_number", async (req, res) => {
  try {
    const itemNumber = req.params.item_number;

    // Find the item document with the specified Item_Number
    const item = await itemsModel.findOne({ Item_Number: itemNumber });

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Check if "OOS" field exists in the item
    const isLowOnStock = item.Low_Stock || false;

    res.status(200).json({ Low_Stock: isLowOnStock });
  } catch (error) {
    console.error("Error fetching out-of-stock status", error);
    res.status(500).json({
      message: "Could not fetch out-of-stock status",
      error: error.message,
    });
  }
});

app.post("/add-oos/:item_number", async (req, res) => {
  try {
    const itemNumber = req.params.item_number;
    const isOutOfStock = req.body.OOS;

    // Find the item document with the specified Item_Number
    const item = await itemsModel.findOne({ Item_Number: itemNumber });

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Check if "OOS" field exists in the item
    if (!item.OOS) {
      // If it doesn't exist, create the field
      item.OOS = isOutOfStock;
    } else {
      // If it exists, update the value
      item.OOS = isOutOfStock;
    }

    // Save the updated document
    await item.save();
    res
      .status(200)
      .json({ message: "Out of stock status updated successfully" });
  } catch (error) {
    console.error("Error updating out-of-stock status", error);
    res.status(500).json({
      message: "Could not update out-of-stock status",
      error: error.message,
    });
  }
});

app.put("/toggle-oos/:itemnum", async (req, res) => {
  try {
    const itemId = req.params.itemnum;
    const item = await itemsModel.findOne({ Item_Number: itemId });

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    item.OOS = !item.OOS;

    // Save the updated document
    const updatedItem = await item.save();

    return res.status(200).json(updatedItem);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

app.put("/toggle-subcategory-oos/:subcategory", async (req, res) => {
  try {
    const subcategory = req.params.subcategory;

    // Find all items in the specified subcategory
    const items = await itemsModel.find({ SubCategory: subcategory });

    if (items.length === 0) {
      return res
        .status(404)
        .json({ message: "No items found in the specified subcategory" });
    }

    // Toggle the "OOS" property for each item
    items.forEach(async (item) => {
      item.OOS = !item.OOS;
      await item.save();
    });

    return res
      .status(200)
      .json({ message: "OOS status toggled for all items in the subcategory" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/add-lowStock/:item_number", async (req, res) => {
  try {
    const itemNumber = req.params.item_number;
    const isLowOnStock = req.body.Low_Stock;

    // Find the item document with the specified Item_Number
    const item = await itemsModel.findOne({ Item_Number: itemNumber });

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Check if "OOS" field exists in the item
    if (!item.Low_Stock) {
      // If it doesn't exist, create the field
      item.Low_Stock = isLowOnStock;
    } else {
      // If it exists, update the value
      item.Low_Stock = isLowOnStock;
    }

    // Save the updated document
    await item.save();
    res
      .status(200)
      .json({ message: "Low on stock status updated successfully" });
  } catch (error) {
    console.error("Error updating Low-on-stock status", error);
    res.status(500).json({
      message: "Could not update low-on-stock status",
      error: error.message,
    });
  }
});

app.put("/toggle-lowStock/:itemnum", async (req, res) => {
  try {
    const itemId = req.params.itemnum;
    const item = await itemsModel.findOne({ Item_Number: itemId });

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    item.Low_Stock = !item.Low_Stock;

    // Save the updated document
    const updatedItem = await item.save();

    return res.status(200).json(updatedItem);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

//update in stock date
app.put("/update-date/:itemnum", async (req, res) => {
  try {
    const itemId = req.params.itemnum;
    const newDate = req.body.newDate; // Assuming the new date is sent in the request body
    // Find the document by the Item_Number
    const item = await itemsModel.findOne({ Item_Number: itemId });
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    // Log the newDate value to check if it's received correctly
    console.log("Received newDate:", newDate);
    // Update the date field with the new date
    item.Date = newDate; // Use the correct field name "Date"
    // Log the updated item to check if the Date field is updated
    console.log("Updated item:", item);
    // Save the updated document
    const updatedItem = await item.save();

    return res.status(200).json(updatedItem);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

//add alternative item options to list
app.put("/add-alt-item/:itemnum", async (req, res) => {
  const itemId = req.params.itemnum;
  const newAltString = req.body.Alt;

  console.log("Received Request Body:", req.body);
  console.log("itemId:", itemId);
  console.log("newAltString:", newAltString);

  try {
    await itemsModel.updateOne(
      { Item_Number: itemId },
      { $push: { Alt: newAltString } }
    );

    return res.status(200).json({ message: "Alt string added successfully" });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/remove-alt-item/:itemnum", async (req, res) => {
  const itemId = req.params.itemnum;
  const altStringToRemove = req.body.altStringToRemove; // Assuming you send the altString to be removed in the request body

  try {
    // Find the item by ID
    const item = await itemsModel.findOne({ Item_Number: itemId });

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Check if the "Alt" array contains the altString to remove
    const altIndex = item.Alt.indexOf(altStringToRemove);

    if (altIndex === -1) {
      return res
        .status(404)
        .json({ message: "Alt string not found in the array" });
    }

    // Remove the altString from the "Alt" array
    item.Alt.splice(altIndex, 1);

    // Save the updated item
    await item.save();

    return res.status(200).json({ message: "Alt string removed successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/delete-date/:itemnum", async (req, res) => {
  try {
    const itemId = req.params.itemnum;

    // Find the document by the Item_Number
    const item = await itemsModel.findOne({ Item_Number: itemId });

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Remove the Date field from the document
    item.Date = null; // Set it to null or undefined, depending on your preference

    // Save the updated document without the Date field
    const updatedItem = await item.save();

    return res.status(200).json(updatedItem);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

//Requests for adding related items to an item

//Add Promo, add items to lists

app.get("/get-promo", async (req, res) => {
  try {
    const newItem = await itemsModel.find({ Promo: true });
    res.json(newItem);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.put("/toggle-promo/:itemnum", async (req, res) => {
  try {
    const itemId = req.params.itemnum;
    const item = await itemsModel.findOne({ Item_Number: itemId });

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    item.Promo = !item.Promo;

    // Save the updated document
    const updatedItem = await item.save();

    return res.status(200).json(updatedItem);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/promo-items", async (req, res) => {
  try {
    // Fetch promo items from the database
    const promoItems = await promoItemModel.find();

    // Respond with the fetched promo items
    res.json(promoItems);
  } catch (error) {
    // Handle any errors that occur during the database query
    res.status(500).json({ error: "Failed to fetch promo items" });
  }
});

app.post("/add/promo-items/:itemNum", async (req, res) => {
  try {
    const newItemData = req.body; // This should contain the selected item data
    console.log("Received data:", newItemData);
    const itemNum = req.params.itemNum;
    console.log("Received request for item number:", itemNum);
    const newPromoItem = new promoItemModel(newItemData);
    await newPromoItem.save();
    console.log(newPromoItem);
    res.status(201).json(newPromoItem);
  } catch (error) {
    console.error("Error adding promo item:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.delete("/delete/promo-item/:itemId", async (req, res) => {
  try {
    const itemId = req.params.itemId; // Get the item ID from the URL parameter

    // Find and delete the item in the promos collection by its ID
    const deletedItem = await promoItemModel.findOneAndDelete({
      Item_Number: itemId,
    });

    if (!deletedItem) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.status(200).json(deletedItem);
  } catch (error) {
    console.error("Error deleting promo item:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//pricing and add item

app.post("/add", async (req, res) => {
  try {
    const {
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
    } = req.body;

    // Validate input data (you can add more validation logic here)
    if (!Item_Number || !Name || !Category) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const newItem = new itemsModel({
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

    // Flatten the Pricing data into the desired format
    const flattenedPricing = [];
    Pricing.forEach((entry) => {
      const priceArray = [entry.label];
      priceArray.push(...entry.prices);
      flattenedPricing.push(priceArray);
    });

    // Create a new item document
    const newItem = new PricingModel({
      Item_Number,
      Name,
      Pricing: flattenedPricing,
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

//images

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
