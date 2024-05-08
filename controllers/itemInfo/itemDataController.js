const itemsModel = require("../../models/itemsCollection");

//Get items through Search
async function getItemData(req, res) {
  const itemNumber = req.query.item;

  if (!itemNumber) {
    return res
      .status(400)
      .send("Item number is required in the query parameters.");
  }

  try {
    // Log the request
    console.log("Request:", req.query);

    // Log all items in the collection
    // const allItems = await itemsModel.find({});
    // console.log("All Items in Collection:", allItems);

    // Query the specific item
    const item = await itemsModel.findOne({ Item_Number: itemNumber });

    if (!item) {
      return res.status(404).send("Item not found");
    }

    // Log the retrieved item
    console.log("Retrieved Item:", item);

    res.send(item);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
}

module.exports = { getItemData };
