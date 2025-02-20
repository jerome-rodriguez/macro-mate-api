import dinnerData from "../seed-data/dinner_logs.js";

export async function seed(knex) {
  await knex("dinner_logs").del();
  await knex("dinner_logs").insert(dinnerData);
}
