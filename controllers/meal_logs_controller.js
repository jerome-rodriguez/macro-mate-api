import initKnex from "knex";
import configuration from "../knexfile.js";
const knex = initKnex(configuration);
import axios from "axios";

const getAllMealLogs = async (_req, res) => {
  try {
    const data = await knex("meal_logs");
    res.status(200).json(data);
  } catch (err) {
    res.status(400).send(`Error retrieving meal logs: ${err}`);
  }
};

const getMealLogsOfADate = async (req, res) => {
  try {
    const data = await knex("meal_logs").where({ date: req.params.date });
    res.status(200).json(data);
  } catch (err) {
    res.status(400).send(`Error retrieving meal logs: ${err}`);
  }
};

const deleteMealLogsOfADate = async (req, res) => {
  try {
    const { date } = req.params;
    const data = await knex("meal_logs").where({ date: req.params.date });

    await knex("meal_logs").where({ date }).del();

    res.status(200).json(data);
  } catch (err) {
    res.status(400).send(`Error deleting meal logs: ${err}`);
  }
};

const getMealLog = async (req, res) => {
  try {
    const data = await knex("meal_logs").where({ id: req.params.id }).first();
    res.status(200).json(data);
  } catch (err) {
    res.status(400).send(`Error retrieving meal log: ${err}`);
  }
};

const editMealLog = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, meal_type, calories, protein, carbs, fat } = req.body;

    // Fetch existing meal log
    const mealLog = await knex("meal_logs").where({ id }).first();
    if (!mealLog) {
      return res.status(404).json({ error: `Meal log not found` });
    }

    let updatedFields = {
      meal_type: meal_type ?? mealLog.meal_type,
    };

    // If any macros (calories, protein, carbs, fat) are edited, disallow editing of amount
    if (calories || protein || carbs || fat) {
      if (amount) {
        return res
          .status(400)
          .json({ error: "Cannot edit amount while updating macros." });
      }

      updatedFields = {
        ...updatedFields,
        calories: calories ?? mealLog.calories,
        protein: protein ?? mealLog.protein,
        carbs: carbs ?? mealLog.carbs,
        fat: fat ?? mealLog.fat,
      };
    }

    // If amount is updated, dynamically recalculate macros using Gemini API
    if (amount && amount !== mealLog.amount) {
      const prompt = `A reliable database claims ${mealLog.amount}g of ${mealLog.name} contains:
      - Calories: ${mealLog.calories} kcal
      - Protein: ${mealLog.protein}g
      - Carbs: ${mealLog.carbs}g
      - Fat: ${mealLog.fat}g

      Calculate the estimated macronutrient values for ${amount}g? Respond ONLY in a valid JSON format:
      {
        "calories": estimated_calories,
        "protein": estimated_protein,
        "carbs": estimated_carbs,
        "fat": estimated_fat
      }`;

      const geminiResponse = await axios.post(
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
        },
        { headers: { "Content-Type": "application/json" } }
      );

      // Extract raw text response
      const responseText =
        geminiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text;

      let cleanResponseText = responseText.replace(/```json|```/g, "").trim();

      let newMacros = {};

      try {
        newMacros = JSON.parse(cleanResponseText); // Attempt to parse the cleaned response
      } catch (error) {
        console.error("Error parsing response:", error.message); // More detailed error log
        return res.status(500).json({ error: "Error parsing AI response" });
      }

      // Validate response
      if (
        newMacros.calories !== undefined &&
        newMacros.protein !== undefined &&
        newMacros.carbs !== undefined &&
        newMacros.fat !== undefined
      ) {
        updatedFields = {
          ...updatedFields,
          amount,
          calories: Math.round(newMacros.calories),
          protein: Math.round(newMacros.protein),
          carbs: Math.round(newMacros.carbs),
          fat: Math.round(newMacros.fat),
        };
      } else {
        return res.status(500).json({ error: "Invalid AI response format" });
      }
    } else {
      // If no amount is provided, allow updating the meal type and macros (calories, protein, carbs, fat)
      updatedFields.amount = mealLog.amount; // Keep the original amount if it's not being updated
    }

    // Update meal log in the database
    await knex("meal_logs").where({ id }).update(updatedFields);

    // Return updated meal log
    const updatedMealLog = await knex("meal_logs").where({ id }).first();
    res.status(200).json(updatedMealLog);
  } catch (err) {
    console.error("Error:", err.message); // Log the full error for debugging
    res.status(500).json({ error: `Error updating meal log: ${err.message}` });
  }
};

const deleteMealLog = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await knex("meal_logs").where({ id }).first();

    await knex("meal_logs").where({ id }).del();

    res.status(200).json(data);
  } catch (err) {
    res.status(400).send(`Error deleting meal log: ${err}`);
  }
};

export {
  getAllMealLogs,
  getMealLogsOfADate,
  deleteMealLogsOfADate,
  getMealLog,
  editMealLog,
  deleteMealLog,
};
