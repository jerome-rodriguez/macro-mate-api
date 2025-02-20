import lunchData from "../seed-data/lunch_logs.js";

export async function seed(knex) {
  await knex("lunch_logs").del();
  await knex("lunch_logs").insert(lunchData);
}
