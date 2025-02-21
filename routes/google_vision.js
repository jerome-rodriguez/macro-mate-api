import express from "express";
const router = express.Router();

import { uploadFoodImg } from "../controllers/googleVisionController.js";

// Upload image to Cloudinary & send to Google Vision
router.post("/upload", uploadFoodImg);

export default router;
