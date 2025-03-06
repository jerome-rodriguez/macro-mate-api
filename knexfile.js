import "dotenv/config";

export default {
  client: "pg",
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  },
  migrations: {
    tableName: "knex_migrations",
  },
};
