import "dotenv/config";
import cors from "cors";
import express from "express";
const app = express();

const PORT = process.env.PORT || 5050;

import foodRoutes from "./routes/food_items.js";

app.use(cors());
app.use(express.json());

// basic home route
app.get("/", (req, res) => {
  res.send("Welcome to my API");
});

// all users routes
app.use("/food-items", foodRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on: http://localhost:${PORT}`);
});
