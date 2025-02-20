export function up(knex) {
  return knex.schema.createTable("food_items", function (table) {
    table.increments("id").primary();
    table.string("name").notNullable();
    table.integer("calories").notNullable();
    table.float("protein").notNullable();
    table.float("carbs").notNullable();
    table.float("fat").notNullable();
    table.string("image_url");
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
}

export function down(knex) {
  return knex.schema.dropTable("food_items");
}
