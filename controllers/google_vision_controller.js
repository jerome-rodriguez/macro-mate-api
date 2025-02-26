import formidable from "formidable";
import fs from "fs";
import cloudinary from "../config/cloudinary.js";
import axios from "axios";
import vision from "@google-cloud/vision";
import "dotenv/config";
import initKnex from "knex";
import configuration from "../knexfile.js";

const knex = initKnex(configuration);

const client = new vision.ImageAnnotatorClient({
  keyFilename: process.env.GOOGLE_API_CREDENTIALS,
});

// ✅ Function to Get Macros from Google Gemini API
const getMacrosFromAI = async (foodLabel) => {
  try {
    console.log(`🔍 Asking AI for macros of: ${foodLabel}`);

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        model: "gemini-pro",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Give me the estimated macronutrients for 100 grams (g) of ${foodLabel} in JSON format. Provide values for calories, protein (g), carbs (g), and fat (g). Do NOT include any other text, just JSON output.`,
              },
            ],
          },
        ],
      }
    );

    // 🔍 Debugging API Response
    console.log("🔍 AI Full Response:", JSON.stringify(response.data, null, 2));

    // ✅ Extracting JSON Output Properly
    const aiResponse =
      response.data.candidates[0]?.content?.parts?.[0]?.text.trim() || "";

    if (!aiResponse.includes("{") || !aiResponse.includes("}")) {
      throw new Error("AI response does not contain valid JSON.");
    }

    const jsonText = aiResponse.substring(
      aiResponse.indexOf("{"),
      aiResponse.lastIndexOf("}") + 1
    );
    const macros = JSON.parse(jsonText);
    console.log("✅ Parsed Macros:", macros);

    return macros;
  } catch (error) {
    console.error(
      "❌ Error fetching macros from AI:",
      error.response?.data || error.message
    );
    throw new Error("Failed to retrieve macros");
  }
};

// ✅ Upload Food Image and Process with Cloudinary, Vision API, and Gemini AI
const uploadFoodImg = async (req, res) => {
  try {
    const form = formidable({ multiples: false });

    form.parse(req, async (err, fields, files) => {
      if (err || !files.image) {
        return res
          .status(400)
          .json({ error: "No image provided or file parsing error" });
      }

      const imageFile = files.image[0] || files.image;
      if (!imageFile || !imageFile.filepath) {
        return res.status(400).json({ error: "Invalid file format" });
      }

      const imagePath = imageFile.filepath;
      console.log("✅ File Received:", imagePath);

      // ✅ Upload to Cloudinary
      let uploadResult;
      try {
        console.log("🔍 Uploading file to Cloudinary:", imagePath);
        uploadResult = await cloudinary.uploader.upload(imagePath, {
          folder: "uploads",
        });
      } catch (cloudinaryError) {
        console.error("❌ Cloudinary Upload Failed:", cloudinaryError);
        return res.status(500).json({ error: "Cloudinary upload failed" });
      }

      const imageUrl = uploadResult.secure_url;
      console.log("✅ Cloudinary Upload Success:", imageUrl);

      // ✅ Send Image URL to Google Vision API
      let highestTopicalityLabel;
      try {
        const response = await axios.post(
          `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_API_KEY}`,
          {
            requests: [
              {
                image: { source: { imageUri: imageUrl } },
                features: [{ type: "LABEL_DETECTION" }],
              },
            ],
          }
        );

        const labels = response.data.responses[0].labelAnnotations;
        if (!labels || labels.length === 0) {
          return res.status(404).json({ error: "No labels found in image" });
        }

        // ✅ Find the label with the highest topicality
        highestTopicalityLabel = labels.reduce((max, label) =>
          label.topicality > max.topicality ? label : max
        ).description;
      } catch (visionError) {
        console.error("❌ Google Vision API Error:", visionError);
        return res
          .status(500)
          .json({ error: "Google Vision API request failed" });
      }

      console.log("✅ Highest Topicality Label:", highestTopicalityLabel);

      // ✅ Validate and Extract `mealType`
      //   const validMealTypes = ["breakfast", "lunch", "dinner"];
      const mealType = fields.mealType;

      //   if (!mealType || !validMealTypes.includes(mealType)) {
      //     return res.status(400).json({
      //       error:
      //         "Invalid meal type. Must be 'breakfast', 'lunch', or 'dinner'.",
      //     });
      //   }

      // ✅ Get Macros from Google Gemini AI
      let macros;
      try {
        macros = await getMacrosFromAI(highestTopicalityLabel);
      } catch (error) {
        return res
          .status(500)
          .json({ error: "Failed to fetch macros from AI" });
      }

      console.log("✅ Macros:", macros);

      // ✅ Check if food item already exists in `food_items`
      let foodId;
      const existingFood = await knex("food_items")
        .where({ name: highestTopicalityLabel })
        .first();
      if (existingFood) {
        foodId = existingFood.id;
      } else {
        const newFood = await knex("food_items").insert({
          name: highestTopicalityLabel,
          calories: macros.calories,
          protein: macros.protein,
          carbs: macros.carbs,
          fat: macros.fat,
          amount: 100,
        });

        foodId = newFood[0];
      }

      // ✅ Insert food into `meal_logs`
      await knex("meal_logs").insert({
        food_id: foodId,
        name: highestTopicalityLabel, // ✅ Add food name
        meal_type: mealType, // ✅ Ensure meal type is provided
        calories: macros.calories, // ✅ Add macros
        protein: macros.protein, // ✅ Add macros
        carbs: macros.carbs, // ✅ Add macros
        fat: macros.fat, // ✅ Add macros
        amount: 100,
        date: knex.fn.now(),
      });

      console.log("✅ Food added to meal_logs successfully");
      res.json({
        success: true,
        imageUrl,
        label: highestTopicalityLabel,
        macros,
        mealType,
      });

      // ✅ Delete local file after upload
      fs.unlink(imagePath, (unlinkError) => {
        if (unlinkError)
          console.error("❌ Error deleting temp file:", unlinkError);
        else console.log("🗑️ Temp file deleted successfully:", imagePath);
      });
    });
  } catch (error) {
    console.error("❌ General Server Error:", error);
    res.status(500).json({ error: "Error processing image" });
  }
};

export { uploadFoodImg };
