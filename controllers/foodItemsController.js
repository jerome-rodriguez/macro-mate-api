import initKnex from "knex";
import configuration from "../knexfile.js";
const knex = initKnex(configuration);

const addFoodItem = async (req, res) => {
  const { name, calories, protein, carbs, fat, amount, mealType } = req.body;

  if (
    !name ||
    !calories ||
    !protein ||
    !carbs ||
    !fat ||
    !amount ||
    !mealType
  ) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    // Step 1: Insert food item into `food_logs` table
    const foodLogId = await knex("food_items").insert({
      name,
      calories,
      protein,
      carbs,
      fat,
      amount, // Store meal_type in food_logs table
    });

    const newFoodLogId = foodLogId[0];

    // Step 2: Insert the food item into `meal_logs` table with the food_log_id
    await knex("meal_logs").insert({
      name,
      calories,
      protein,
      carbs,
      fat,
      food_id: newFoodLogId, // Link the food log to the meal log
      meal_type: mealType, // Meal type, can be breakfast, lunch, dinner
      date: new Date().toLocaleDateString("en-CA"), // Use current date for meal log
    });

    // Step 3: Return the newly added food item (optional)
    const addedFoodItem = await knex("food_items").where({
      id: newFoodLogId,
    });

    res.status(200).json(addedFoodItem);
  } catch (err) {
    res.status(500).json({
      error: `Error adding food item: ${err.message}`,
    });
  }
};

// const editFoodItem = async (req, res) => {
//   const { name, calories, protein, carbs, fat, amount, meal_type } = req.body;

//   if (
//     !name ||
//     !calories ||
//     !protein ||
//     !carbs ||
//     !fat ||
//     !amount ||
//     !meal_type
//   ) {
//     return res.status(400).json({ error: "All fields are required." });
//   }

//   const validMealTypes = ["Breakfast", "Lunch", "Dinner"];
//   if (!validMealTypes.includes(meal_type)) {
//     return res.status(400).json({
//       error: "Invalid meal type. It must be 'Breakfast', 'Lunch', or 'Dinner'.",
//     });
//   }

//   try {
//     const foodItem = await knex("food_items").where({
//       id: req.params.id,
//     });

//     if (!foodItem) {
//       return res.status(404).json({ error: `Food item not found` });
//     }
//     const updateFoodItem = await knex("food_items")
//       .where({ id: req.params.id })
//       .update({
//         name,
//         calories,
//         protein,
//         carbs,
//         fat,
//         amount,
//         meal_type,
//       });

//     const updatedFoodItem = await knex("food_items").where({
//       id: req.params.id,
//     });
//     res.status(200).json(updatedFoodItem[0]);
//   } catch (err) {
//     res.status(500).json({
//       error: `Error updating food item: ${err.message}`,
//     });
//   }
// };

const editFoodItem = async (req, res) => {
  try {
    const { id } = req.params;
    const foodItem = await knex("food_items").where({ id }).first();

    if (!foodItem) {
      return res.status(404).json({ error: `Food item not found` });
    }

    // Merge old values with new ones (keep existing values if not provided)
    const updatedFields = {
      name: req.body.name ?? foodItem.name,
      calories: req.body.calories ?? foodItem.calories,
      protein: req.body.protein ?? foodItem.protein,
      carbs: req.body.carbs ?? foodItem.carbs,
      fat: req.body.fat ?? foodItem.fat,
      amount: req.body.amount ?? foodItem.amount,
      meal_type: req.body.meal_type ?? foodItem.meal_type,
    };

    // Validate meal type if provided
    if (req.body.meal_type) {
      const validMealTypes = ["Breakfast", "Lunch", "Dinner"];
      if (!validMealTypes.includes(req.body.meal_type)) {
        return res.status(400).json({
          error:
            "Invalid meal type. It must be 'Breakfast', 'Lunch', or 'Dinner'.",
        });
      }
    }

    // Update only the provided fields
    await knex("food_items").where({ id }).update(updatedFields);

    // Return updated item
    const updatedFoodItem = await knex("food_items").where({ id }).first();
    res.status(200).json(updatedFoodItem);
  } catch (err) {
    res.status(500).json({
      error: `Error updating food item: ${err.message}`,
    });
  }
};

const deleteFoodItem = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await knex("food_items").where({ id }).first();

    if (!data) {
      return res.status(404).json({ error: `Food item not found` });
    }

    await knex("food_items").where({ id }).del();

    res.status(200).json(data);
  } catch (err) {
    res.status(400).send(`Error deleting food item: ${err}`);
  }
};

const getAllFoodItems = async (_req, res) => {
  try {
    const data = await knex("food_items");
    res.status(200).json(data);
  } catch (err) {
    res.status(400).send(`Error retrieving food items: ${err}`);
  }
};

const getFoodItem = async (req, res) => {
  try {
    const data = await knex("food_items").where({ id: req.params.id });
    res.status(200).json(data);
  } catch (err) {
    res.status(400).send(`Error retrieving food item: ${err}`);
  }
};

export {
  addFoodItem,
  editFoodItem,
  deleteFoodItem,
  getAllFoodItems,
  getFoodItem,
};
