import express from "express";
const router = express.Router();

import {
  addFoodItem,
  // editFoodItem,
  // deleteFoodItem,
  getAllFoodItems,
  getFoodItem,
} from "../controllers/food_items_controller.js";

router.get("/", getAllFoodItems);

router.post("/", addFoodItem);

router.get("/:id", getFoodItem);

// router.put("/:id", editFoodItem);
// router.delete("/:id", deleteFoodItem);

export default router;
