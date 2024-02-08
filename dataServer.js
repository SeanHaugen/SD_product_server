const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const adherenceModel = require("./dataModels/adherence");

DATABASE_PASSWORD = "DkD0ml96WSM62TAn";
DATABASE = `mongodb+srv://seanhaugen560:${DATABASE_PASSWORD}@cluster0.adhrbht.mongodb.net/dashboard`;

const app = express();
const port = process.env.PORT || 4001;

app.use(cors());
app.use(express.json());

mongoose.connect(DATABASE, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", (error) => console.error(`MongoDB connection error: ${error}`));
db.once("open", () => console.log("Connected to MongoDB"));

app.get("/data", async (req, res) => {
  try {
    const data = await adherenceModel.find({});

    if (data.length === 0) {
      return res.status(404).send("Data not found");
    }

    res.send(data);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
