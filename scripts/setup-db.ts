import { resetDatabase } from "../src/server/db";

await resetDatabase();
console.log("SQLite database seeded at data/dev.db");

