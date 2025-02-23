import express from "express";
const router = express.Router();

import {
  addFoodItem,
  searchFoodItem,
  // parseFoodDescription,
} from "../controllers/food_search_controller.js";

router.get("/search", searchFoodItem);

router.post("/add", addFoodItem);

// router.get("/parse", parseFoodDescription);

export default router;
