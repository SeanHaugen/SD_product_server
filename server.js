const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const path = require("path");
const fs = require("fs");
const axios = require("axios");

const itemsModel = require("./models/itemsCollection");
const PricingModel = require("./models/priceCollection");
const EurofitModel = require("./models/eurofitCollection");
const flatRateModel = require("./models/flatRateCollection");
const InfoModel = require("./models/infoCollection");
const mediaModel = require("./models/mediaCollection");
const promoItemModel = require("./models/promoCollection");
const additionalInfoModel = require("./models/addtionalInfoCollection");
const UserModel = require("./models/userCollection");

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

/////////////////////////////////////////
//user authentication

app.post("/register", async (req, res) => {
  try {
    console.log("Received a registration request");
    const { username, password } = req.body;

    // Validate user data (you can add more validation)
    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Please provide all required fields." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user in the database
    const user = new UserModel({ username, password: hashedPassword });
    await user.save();

    return res.status(201).json({ message: "User registered successfully." });
  } catch (error) {
    console.error("Error during registration:", error.message);
    return res
      .status(500)
      .json({ error: "Registration failed. Please try again later." });
  }
});

const secretKey = process.env.SECRET_KEY || "default-secret-key";

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find the user by email
    const user = await UserModel.findOne({ username });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // Compare the hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // Generate a JWT
    const token = jwt.sign({ userId: user._id }, secretKey, {
      expiresIn: "1h",
    });

    return res.json({ token });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Login failed. Please try again later." });
  }
});

//Get requests from the ItemsCollections
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

app.get("/items/oos", async (req, res) => {
  try {
    const oosItems = await itemsModel.find({ OOS: true });
    res.json(oosItems);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
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

app.get("/specsForMedia", async (req, res) => {
  try {
    // Fetch all mediaspecs from the "mediaspecs" collection
    const mediaspecs = await mediaModel.find();

    if (!mediaspecs || mediaspecs.length === 0) {
      return res.status(404).json({ error: "No mediaspecs found" });
    }

    res.json(mediaspecs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//Get similar products from items collection

app.get("/document/:pattern", async (req, res) => {
  try {
    const paramPattern = req.params.pattern;

    // Use Mongoose to find documents with names matching the provided pattern
    const documents = await Document.find({
      name: { $regex: paramPattern, $options: "i" }, // Case-insensitive regex search
    });

    res.json({ documents });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
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
    if ("Description" in req.body)
      itemToUpdate.Description += " " + req.body.Description;
    if ("Materials" in req.body)
      itemToUpdate.Materials += " " + req.body.Materials;
    if ("Package_Weight" in req.body)
      itemToUpdate.Package_Weight += " " + req.body.Package_Weight;
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
      item.additional_info = newAdditionalInfo;
    } else {
      // If it exists, append the new value to the existing value
      item.additional_info += "\n" + newAdditionalInfo; // You can choose a delimiter, like a newline, to separate values
    }

    // Save the updated document
    await item.save();
    res.status(200).json({ message: "Additional info updated successfully" });
  } catch (error) {
    console.error("Error adding document", error);
    res
      .status(500)
      .json({ message: "Could not add document", error: error.message });
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
//Put requests for details

////////////////////////////////////////
//requests for OOS/low inventory

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
    const returnDate = req.body.date;
    const alternativeOption = req.body.option;
    // Find the document by the Item_Number
    const item = await itemsModel.findOne({ Item_Number: itemId });

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Toggle the existing "OOS" field
    item.OOS = !item.OOS;

    if (returnDate) {
      item.returnDate = returnDate;
    }

    if (alternativeOption) {
      item.alternativeOption = alternativeOption;
    }

    // Save the updated document
    const updatedItem = await item.save();

    return res.status(200).json(updatedItem);
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

    // Find the document by the Item_Number
    const item = await itemsModel.findOne({ Item_Number: itemId });

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Toggle the existing "OOS" field
    item.Low_Stock = !item.Low_Stock;

    // if (req.body.isLowStock !== undefined) {
    //   item.Low_Stock = req.body.isLowStock;
    // }

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
  const newAltString = req.body.newAltString; // Assuming you send the newAltString in the request body

  try {
    // Find the item by ID
    const item = await itemsModel.findOne({ Item_Number: itemId });

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Add the newAltString to the "Alt" array
    item.Alt.push(newAltString);

    // Save the updated item
    await item.save();

    return res.status(200).json({ message: "Alt string added successfully" });
  } catch (error) {
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

//Add new items, add items to lists

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

const githubRepoUrl =
  "https://raw.githubusercontent.com/SeanHaugen/SD_product_server/main/images/";

app.get("/images/:filename", async (req, res) => {
  const filename = req.params.filename + ".jpg";

  // Construct the raw content URL for the image
  const imageUrl = `${githubRepoUrl}${filename}`;

  try {
    // Fetch the image from the GitHub repository
    const imageResponse = await axios.get(imageUrl, {
      responseType: "arraybuffer",
    });

    // Set the appropriate content type for the response
    res.set("Content-Type", "image/jpeg");

    // Send the image data as the response
    res.send(Buffer.from(imageResponse.data, "binary"));
  } catch (error) {
    console.error(error);
    res.status(404).send("Image not found");
  }
});

// app.get("/images/:filename", (req, res) => {
//   let filename = req.params.filename;

//   // Decode the filename
//   filename = decodeURIComponent(filename);

//   // Add ".jpg" to the filename
//   filename += ".jpg";

//   // Combine the network path with the filename
//   const imagePath = path.join(networkImagePath, filename);

//   console.log("Constructed Image Path:", imagePath);

//   // Convert the network path to an absolute path
//   const absoluteImagePath = path.resolve(imagePath);

//   console.log("Absolute Image Path:", absoluteImagePath);

//   // Check if the file exists
//   fs.stat(absoluteImagePath, (err, stats) => {
//     if (err) {
//       console.error(err);
//       res.status(404).send("Image not found");
//     } else {
//       // Send the image as a response
//       res.sendFile(absoluteImagePath, (err) => {
//         if (err) {
//           console.error(err);
//           res.status(404).send("Image not found");
//         }
//       });
//     }
//   });
// });

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
