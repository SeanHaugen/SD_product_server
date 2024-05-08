async function getItem(req, res) {
  const itemNumber = req.query.item;

  if (!itemNumber) {
    return res
      .status(400)
      .send("Item number is required in the query parameters.");
  }

  try {
    // Log the request
    console.log("Request:", req.query);

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

module.exports = {
  getItem,
};
