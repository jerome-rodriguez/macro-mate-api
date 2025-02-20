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

export { getAllFoodItems };
