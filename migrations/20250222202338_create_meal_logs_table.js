export function up(knex) {
  return (
    knex.schema

      // Create meal_logs table
      .createTable("meal_logs", function (table) {
        table.increments("id").primary();
        table
          .integer("food_id")
          .unsigned()
          .references("id")
          .inTable("food_items")
          .onDelete("SET NULL");
        table.string("name").notNullable(); // Snapshot of food name
        table.integer("calories").notNullable(); // Snapshot of food macros
        table.float("protein").notNullable();
        table.float("carbs").notNullable();
        table.float("fat").notNullable();
        table.float("amount").notNullable(); // User's portion size
        table.enu("meal_type", ["Breakfast", "Lunch", "Dinner"]).notNullable();
        table.date("date").notNullable();
        table.timestamp("created_at").defaultTo(knex.fn.now());
      })
  );
}

export function down(knex) {
  return knex.schema.dropTable("meal_logs");
}
