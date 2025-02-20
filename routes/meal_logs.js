import express from "express";
const router = express.Router();

import {
  getAllMealLogs,
  getMealLog,
  deleteMealLog,
} from "../controllers/mealLogsController.js";

router.get("/", getAllMealLogs);

router.get("/:date", getMealLog);

router.delete("/:date", deleteMealLog);

export default router;
