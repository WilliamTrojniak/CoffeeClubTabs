import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL 

});

const db = drizzle(pool);

async function main() {
  console.log("Migration started...");
  await migrate(db, {migrationsFolder: "drizzle"});
  console.log("Migration complete.");
  process.exit(0);
}

main().catch(err => console.log(err));
