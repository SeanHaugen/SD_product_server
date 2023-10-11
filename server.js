const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const getRoutes = require("./requests/GET");

DATABASE_PASSWORD = "DkD0ml96WSM62TAn";
DATABASE = `mongodb+srv://seanhaugen560:DkD0ml96WSM62TAn@cluster0.adhrbht.mongodb.net/`;

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());

mongoose.connect(DATABASE, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", (error) => console.error(`MongoDB connection error: ${error}`));
db.once("open", () => console.log("Connected to MongoDB"));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
