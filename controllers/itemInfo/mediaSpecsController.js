const mediaModel = require("../../models/mediaCollection");

//get media info Specifications
async function getMediaSpecs(req, res) {
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
}

async function getSpecsForMedia(req, res) {
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
}

module.exports = { getMediaSpecs, getSpecsForMedia };
