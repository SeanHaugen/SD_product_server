//Get similar products from items collection
async function getSimilarItems(req, res) {
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
}

module.exports = { getSimilarItems };
