import express from "express";
const router = express.Router();

import {
  addFoodItem,
  editFoodItem,
  deleteFoodItem,
  getAllFoodItems,
  getFoodItem,
} from "../controllers/foodItemsController.js";

router.get("/", getAllFoodItems);

router.post("/", addFoodItem);

router.put("/:id", editFoodItem);
router.delete("/:id", deleteFoodItem);
router.get("/:id", getFoodItem);

export default router;
