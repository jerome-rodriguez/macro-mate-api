import initKnex from "knex";
import configuration from "../knexfile.js";
const knex = initKnex(configuration);
import axios from "axios";
const API_URL = process.env.EDAMAM_API_URL;

// Search food from Edamam API
const searchFoodItem = async (req, res) => {
  try {
    const { query } = req.query;
    const response = await axios.get(`${API_URL}/api/food-database/v2/parser`, {
      params: {
        app_id: process.env.EDAMAM_API_ID,
        app_key: process.env.EDAMAM_API_KEY,
        ingr: query,
      },
    });

    const foods = response.data.hints.map((item) => ({
      name: item.food.label,
      calories: item.food.nutrients.ENERC_KCAL,
      protein: item.food.nutrients.PROCNT,
      carbs: item.food.nutrients.CHOCDF,
      fat: item.food.nutrients.FAT,
    }));

    res.json(foods);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch food data" });
  }
};

// const parseFoodDescription = async (req, res) => {
//   try {
//     const { query } = req.query; // Expecting a full sentence like "2 slices of bread with peanut butter"
//     const response = await axios.get(`${API_URL}/api/food-database/v2/parser`, {
//       params: {
//         app_id: process.env.EDAMAM_API_ID,
//         app_key: process.env.EDAMAM_API_KEY,
//         ingr: query, // NLP food description
//       },
//     });

//     const foods = response.data.hints.map((item) => ({
//       name: item.food.label,
//       quantity: item.measures?.[0]?.quantity || 1, // Extracts quantity if available
//       unit: item.measures?.[0]?.label || "unit", // Extracts unit if available
//       calories: item.food.nutrients.ENERC_KCAL || 0,
//       protein: item.food.nutrients.PROCNT || 0,
//       carbs: item.food.nutrients.CHOCDF || 0,
//       fat: item.food.nutrients.FAT || 0,
//     }));

//     res.json(foods);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to parse food data" });
//   }
// };

const addFoodItem = async (req, res) => {
  try {
    const { name, calories, protein, carbs, fat, mealType } = req.body;

    // Ensure mealType is valid
    const validMealTypes = ["breakfast", "lunch", "dinner"];
    if (!validMealTypes.includes(mealType)) {
      return res.status(400).json({ error: "Invalid meal type" });
    }

    // Insert food into food_items table and get inserted ID
    const [insertedFoodId] = await knex("food_items").insert({
      name,
      calories,
      protein,
      carbs,
      fat,
    });

    if (!insertedFoodId) {
      return res.status(500).json({ error: "Food insertion failed" });
    }

    // Retrieve the inserted food item
    const food = await knex("food_items").where({ id: insertedFoodId }).first();

    if (!food) {
      return res.status(500).json({ error: "Inserted food not found" });
    }

    // Insert into meal_logs
    await knex("meal_logs").insert({
      food_id: food.id,
      name: food.name, // Ensure 'name' is stored
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      meal_type: mealType,
      date: knex.fn.now(),
    });

    res.json({ success: true, message: "Food added successfully" });
  } catch (error) {
    console.error("Error in addFoodItem:", error);
    res.status(500).json({ error: "Error adding food" });
  }
};

export { searchFoodItem, addFoodItem };
