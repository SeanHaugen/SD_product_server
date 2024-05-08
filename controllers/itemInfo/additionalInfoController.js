const InfoModel = require("../../models/infoCollection");
// const InfoModel = require("./models/infoCollection");

async function getAdditionalInfo(req, res) {
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
}

module.exports = { getAdditionalInfo };
