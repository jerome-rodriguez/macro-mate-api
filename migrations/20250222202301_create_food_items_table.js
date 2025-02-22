export function up(knex) {
  return (
    knex.schema
      // Create food_items table
      .createTable("food_items", function (table) {
        table.increments("id").primary();
        table.string("name").unique().notNullable();
        table.integer("calories").notNullable();
        table.float("protein").notNullable();
        table.float("carbs").notNullable();
        table.float("fat").notNullable();
        table.float("amount").notNullable(); // Default serving size
        table.string("img_url");
        table.timestamp("created_at").defaultTo(knex.fn.now());
      })
  );
}

export function down(knex) {
  return knex.schema.dropTable("food_items");
}
