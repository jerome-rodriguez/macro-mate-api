import initKnex from "knex";
import configuration from "../knexfile.js";
const knex = initKnex(configuration);

const getAllMealLogs = async (_req, res) => {
  try {
    const data = await knex("meal_logs");
    res.status(200).json(data);
  } catch (err) {
    res.status(400).send(`Error retrieving meal logs: ${err}`);
  }
};

const getMealLog = async (req, res) => {
  try {
    const data = await knex("meal_logs").where({ date: req.params.date });
    res.status(200).json(data);
  } catch (err) {
    res.status(400).send(`Error retrieving meal log: ${err}`);
  }
};

const deleteMealLog = async (req, res) => {
  try {
    const { date } = req.params;
    const data = await knex("meal_logs").where({ date: req.params.date });

    await knex("meal_logs").where({ date }).del();

    res.status(200).json(data);
  } catch (err) {
    res.status(400).send(`Error deleting meal log: ${err}`);
  }
};

export { getAllMealLogs, getMealLog, deleteMealLog };
