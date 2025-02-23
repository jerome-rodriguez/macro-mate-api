import initKnex from "knex";
import configuration from "../knexfile.js";
const knex = initKnex(configuration);

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
      const [insertedFoodId] = await knex("food_items").insert({
        name,
        calories,
        protein,
        carbs,
        fat,
        amount,
      });

      // Retrieve the inserted food item
      food = await knex("food_items").where({ id: insertedFoodId }).first();
    }

    // Insert into meal_logs using the food item's ID
    await knex("meal_logs").insert({
      food_id: food.id, // Use the existing or newly inserted food item's ID
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      amount: amount,
      meal_type: mealType,
      date: new Date().toLocaleDateString("en-CA"),
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

export { addFoodItem, getAllFoodItems, getFoodItem };

// export {
//   addFoodItem,
//   // editFoodItem,
//   // deleteFoodItem,
//   getAllFoodItems,
//   getFoodItem,
// };

// const editFoodItem = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const foodItem = await knex("food_items").where({ id }).first();

//     if (!foodItem) {
//       return res.status(404).json({ error: `Food item not found` });
//     }

//     // Merge old values with new ones (keep existing values if not provided)
//     const updatedFields = {
//       name: req.body.name ?? foodItem.name,
//       calories: req.body.calories ?? foodItem.calories,
//       protein: req.body.protein ?? foodItem.protein,
//       carbs: req.body.carbs ?? foodItem.carbs,
//       fat: req.body.fat ?? foodItem.fat,
//       amount: req.body.amount ?? foodItem.amount,
//       meal_type: req.body.meal_type ?? foodItem.meal_type,
//     };

//     // Validate meal type if provided
//     if (req.body.meal_type) {
//       const validMealTypes = ["Breakfast", "Lunch", "Dinner"];
//       if (!validMealTypes.includes(req.body.meal_type)) {
//         return res.status(400).json({
//           error:
//             "Invalid meal type. It must be 'Breakfast', 'Lunch', or 'Dinner'.",
//         });
//       }
//     }

//     // Update only the provided fields
//     await knex("food_items").where({ id }).update(updatedFields);

//     // Return updated item
//     const updatedFoodItem = await knex("food_items").where({ id }).first();
//     res.status(200).json(updatedFoodItem);
//   } catch (err) {
//     res.status(500).json({
//       error: `Error updating food item: ${err.message}`,
//     });
//   }
// };

// const deleteFoodItem = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const data = await knex("food_items").where({ id }).first();

//     if (!data) {
//       return res.status(404).json({ error: `Food item not found` });
//     }

//     await knex("food_items").where({ id }).del();

//     res.status(200).json(data);
//   } catch (err) {
//     res.status(400).send(`Error deleting food item: ${err}`);
//   }
// };
