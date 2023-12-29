import { connect } from "@planetscale/database";
import { drizzle } from "drizzle-orm/planetscale-serverless";

const DatabasePage = async () => {
  const connection = connect({
    host: process.env.DATABASE_HOST,
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
  });

  const db = drizzle(connection);
  console.log(db);

  return <h1>Database Page</h1>
}
export default DatabasePage;
