import breakfastData from "../seed-data/breakfast_logs.js";

export async function seed(knex) {
  await knex("breakfast_logs").del();
  await knex("breakfast_logs").insert(breakfastData);
}
