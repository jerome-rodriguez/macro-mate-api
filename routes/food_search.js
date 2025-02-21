import express from "express";
const router = express.Router();

import {
  addFoodItem,
  searchFoodItem,
} from "../controllers/foodSearchController.js";

router.get("/search", searchFoodItem);

router.post("/add", addFoodItem);

export default router;
