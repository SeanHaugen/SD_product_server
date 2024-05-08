const adherenceModel = require("../../models/adherence");

async function getDashboardData(req, res) {
  try {
    const data = await adherenceModel.find(); // Fetch data using the model

    if (!data || data.length === 0) {
      return res.status(404).send("Data not found");
    }

    res.send(data);
  } catch (err) {
    console.error("Error fetching dashboard data:", err);
    res.status(500).send("Internal server error");
  }
}

module.exports = { getDashboardData };
