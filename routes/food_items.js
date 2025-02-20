import express from "express";
const router = express.Router();

import {
  addFoodItem,
  editFoodItem,
  deleteFoodItem,
} from "../controllers/foodItemsController.js";

router.post("/", addFoodItem);

router.put("/:id", editFoodItem).delete("/:id", deleteFoodItem);

export default router;
