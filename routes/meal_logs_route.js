import express from "express";
const router = express.Router();

import {
  getAllMealLogs,
  getMealLogsOfADate,
  deleteMealLogsOfADate,
  getMealLog,
  editMealLog,
  deleteMealLog,
} from "../controllers/meal_logs_controller.js";

router.get("/", getAllMealLogs);

router.get("/date/:date", getMealLogsOfADate);

router.delete("/date/:date", deleteMealLogsOfADate);

router.get("/:id", getMealLog); // i dont think this is needed

router.put("/:id", editMealLog);

router.delete("/:id", deleteMealLog);

export default router;
