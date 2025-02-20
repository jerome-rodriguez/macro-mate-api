import express from "express";
const router = express.Router();

import {
  getAllMealLogs,
  getMealLog,
  deleteMealLog,
} from "../controllers/mealLogsController.js";

router.get("/", getAllMealLogs);

router.get("/:id", getMealLog).delete("/:id", deleteMealLog);

export default router;
