import mealData from "../seed-data/meal_logs.js";

export async function seed(knex) {
  await knex("meal_logs").del();
  await knex("meal_logs").insert(mealData);
}
