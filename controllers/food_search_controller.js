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

const addFoodItem = async (req, res) => {
  try {
    const {
      name,
      calories,
      protein,
      carbs,
      fat,
      amount = 100,
      mealType,
    } = req.body;

    // Check if the food item already exists in the food_items table
    let food = await knex("food_items").where({ name }).first();

    if (!food) {
      // If food doesn't exist, insert it into the food_items table
      const [insertedFood] = await knex("food_items")
        .insert({
          name,
          calories,
          protein,
          carbs,
          fat,
          amount,
        })
        .returning("*");

      food = insertedFood;
    }

    // Insert into meal_logs using the food item's ID
    await knex("meal_logs").insert({
      food_id: food.id,
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      amount,
      meal_type: mealType,
      date: new Date().toISOString().split("T")[0], // Format as YYYY-MM-DD
    });

    // Send back the food name with the success message
    res.json({
      success: true,
      message: `Food item added successfully: ${food.name}`,
      foodName: food.name,
    });
  } catch (error) {
    console.error("Error in addFoodItem:", error);
    res.status(500).json({ error: "Error adding food to meal log" });
  }
};

export { searchFoodItem, addFoodItem };
