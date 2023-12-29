import { connect } from "@planetscale/database";
// import { drizzle } from "drizzle-orm/planetscale-serverless";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const DatabasePage = async () => {
  /*
  const connection = connect({
    host: process.env.DATABASE_HOST,
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
  });

  const db = drizzle(connection);
  console.log(db);
  */

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const db = drizzle(pool);

  console.log(db);

  return <h1>Database Page</h1>
}
export default DatabasePage;
