export function up(knex) {
  return knex.schema.createTable("meal_logs", function (table) {
    table.increments("id").primary();
    table
      .integer("food_id")
      .unsigned()
      .references("id")
      .inTable("food_items")
      .onDelete("CASCADE");
    table.string("name").notNullable();
    table.enu("meal_type", ["Breakfast", "Lunch", "Dinner"]).notNullable(); // Add meal_type column
    table.integer("calories").notNullable();
    table.float("protein").notNullable();
    table.float("carbs").notNullable();
    table.float("fat").notNullable();
    table.date("date").notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
}

export function down(knex) {
  return knex.schema.dropTable("meal_logs"); // Drop the combined table
}
