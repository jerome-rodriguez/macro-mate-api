import foodData from "../seed_data/food_items.js";

export async function seed(knex) {
  await knex("food_items").del();
  await knex("food_items").insert(foodData);
}
