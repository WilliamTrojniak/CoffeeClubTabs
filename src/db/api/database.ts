import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as items from "@/db/schema/items"
import * as receipts from "@/db/schema/receipts"
import * as shops from "@/db/schema/shops"
import * as tabs from "@/db/schema/tabs"
import * as users from "@/db/schema/users"

 const pool = new Pool({
  connectionString: process.env.DATABASE_URL 

});

export const db = drizzle(pool, {schema: {...items, ...receipts, ...shops, ...tabs, ...users}});

export type DBTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

