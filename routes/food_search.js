import express from "express";
const router = express.Router();

import {
  addFoodItem,
  searchFoodItem,
  // parseFoodDescription,
} from "../controllers/foodSearchController.js";

router.get("/search", searchFoodItem);

router.post("/add", addFoodItem);

// router.get("/parse", parseFoodDescription);

export default router;
