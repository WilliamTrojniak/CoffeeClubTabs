import { db } from "./database";
import 'server-only'
import { ItemCategoriesInsert, ItemInsert, itemCategories, items } from "../schema/items";
import { eq } from "drizzle-orm";

export async function insertItemCategory(data: ItemCategoriesInsert) {
  const result = await db.insert(itemCategories).values(data).onConflictDoNothing().returning();
  if (result.length === 0) return null;
  return result[0];
}

export async function insertItem(data: ItemInsert) {
  const result = await db.insert(items).values({
    name: data.name, 
    shopId: data.shopId, 
    basePrice: parseFloat(data.basePrice.toFixed(2))
  }).onConflictDoNothing().returning();

  if (result.length === 0) return null;
  return result[0];
}

export async function queryItemsByShop(shopId: number) {
  const result = await db.query.items.findMany({
    where: eq(items.shopId, shopId),
  });
  return result;
}
