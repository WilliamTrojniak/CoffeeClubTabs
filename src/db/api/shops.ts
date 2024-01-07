import { asc, eq } from "drizzle-orm";
import { ShopInsert, shops } from "../schema/shops";
import { db } from "./database";
import { revalidatePath } from "next/cache";

export async function insertShop(data: ShopInsert) {
  const result = await db.insert(shops).values({ownerId: data.ownerId, name: data.name}).returning();
  if (result.length === 0) return null;
  revalidatePath('/');
  return result[0];
}

export async function queryUserShops(userId: string) {
  const result = await db.select().from(shops).where(eq(shops.ownerId, userId)).orderBy(asc(shops.name));
  return result;
}
