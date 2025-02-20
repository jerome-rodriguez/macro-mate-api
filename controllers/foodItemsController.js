import initKnex from "knex";
import configuration from "../knexfile.js";
const knex = initKnex(configuration);

const addFoodItem = async (req, res) => {
  const { name, calories, protein, carbs, fat, amount, meal_type } = req.body;

  if (
    !name ||
    !calories ||
    !protein ||
    !carbs ||
    !fat ||
    !amount ||
    !meal_type
  ) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const validMealTypes = ["Breakfast", "Lunch", "Dinner"];
  if (!validMealTypes.includes(meal_type)) {
    return res.status(400).json({
      error: "Invalid meal type. It must be 'Breakfast', 'Lunch', or 'Dinner'.",
    });
  }

  try {
    const addFoodItemId = await knex("food_items").insert({
      name,
      calories,
      protein,
      carbs,
      fat,
      amount,
      meal_type,
    });

    const newFoodItemId = addFoodItemId[0];
    const addFoodItemFields = await knex("food_items").where({
      id: newFoodItemId,
    });

    res.status(200).json(addFoodItemFields);
  } catch (err) {
    res.status(500).json({
      error: `Error adding food item: ${err.message}`,
    });
  }
};

const editFoodItem = async (req, res) => {
  const { name, calories, protein, carbs, fat, amount, meal_type } = req.body;

  if (
    !name ||
    !calories ||
    !protein ||
    !carbs ||
    !fat ||
    !amount ||
    !meal_type
  ) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const validMealTypes = ["Breakfast", "Lunch", "Dinner"];
  if (!validMealTypes.includes(meal_type)) {
    return res.status(400).json({
      error: "Invalid meal type. It must be 'Breakfast', 'Lunch', or 'Dinner'.",
    });
  }

  try {
    const foodItem = await knex("food_items").where({
      id: req.params.id,
    });

    if (!foodItem) {
      return res.status(404).json({ error: `Food item not found` });
    }
    const updateFoodItem = await knex("food_items")
      .where({ id: req.params.id })
      .update({
        name,
        calories,
        protein,
        carbs,
        fat,
        amount,
        meal_type,
      });

    const updatedFoodItem = await knex("food_items").where({
      id: req.params.id,
    });
    res.status(200).json(updatedFoodItem[0]);
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

export { addFoodItem, editFoodItem, deleteFoodItem };
