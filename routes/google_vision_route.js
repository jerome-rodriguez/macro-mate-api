import express from "express";
const router = express.Router();

import { uploadFoodImg } from "../controllers/google_vision_controller.js";

// Upload image to Cloudinary & send to Google Vision
router.post("/upload", uploadFoodImg);

export default router;
