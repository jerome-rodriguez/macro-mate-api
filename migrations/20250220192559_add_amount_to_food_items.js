// Migration file: <timestamp>_add_amount_to_food_items.js

export function up(knex) {
  return knex.schema.table("food_items", function (table) {
    table.float("amount").defaultTo(0); // Add the 'amount' column (in grams)
  });
}

export function down(knex) {
  return knex.schema.table("food_items", function (table) {
    table.dropColumn("amount"); // Rollback: Remove the 'amount' column
  });
}
