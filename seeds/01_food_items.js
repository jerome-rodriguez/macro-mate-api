import foodData from "../seed-data/food_items.js";

export async function seed(knex) {
  await knex("food_items").del();
  await knex("food_items").insert(foodData);
}
