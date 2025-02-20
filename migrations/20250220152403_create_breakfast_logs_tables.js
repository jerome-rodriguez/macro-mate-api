export function up(knex) {
  return knex.schema.createTable("breakfast_logs", function (table) {
    table.increments("id").primary();
    table
      .integer("food_id")
      .unsigned()
      .references("id")
      .inTable("food_items")
      .onDelete("CASCADE");
    table.string("name").notNullable();
    table.integer("calories").notNullable();
    table.float("protein").notNullable();
    table.float("carbs").notNullable();
    table.float("fat").notNullable();
    table.date("date").notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
}

export function down(knex) {
  return knex.schema.dropTable("breakfast_logs");
}
