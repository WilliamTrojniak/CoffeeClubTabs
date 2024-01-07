import { asc, eq } from "drizzle-orm";
import { ShopInsert, shops } from "../schema/shops";
import { db } from "./database";

export async function insertShop(data: ShopInsert) {
  const result = await db.insert(shops).values({ownerId: data.ownerId, name: data.name}).onConflictDoNothing().returning();
  if (result.length === 0) return null;
  return result[0];
}

export async function removeShop(shopId: number) {
  const result = await db.delete(shops).where(eq(shops.id, shopId)).returning();
  if (result.length === 0) return null;
  return result[0];
}

export async function queryUserShops(userId: string) {
  const result = await db.select().from(shops).where(eq(shops.ownerId, userId)).orderBy(asc(shops.name));
  return result;
}

export async function queryShopId(id: number) {
  const result = await db.select().from(shops).where(eq(shops.id, id));
  if (result.length === 0) return null;
  return result[0];
}
