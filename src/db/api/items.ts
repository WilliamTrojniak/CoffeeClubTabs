import { db } from "./database";
import 'server-only'
import { ItemCategoriesInsert, itemCategories } from "../schema/items";

export async function insertItemCategory(data: ItemCategoriesInsert) {
  const result = await db.insert(itemCategories).values(data).onConflictDoNothing().returning();
  if (result.length === 0) return null;
  return result[0];
}
