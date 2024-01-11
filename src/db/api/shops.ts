import { asc, eq } from "drizzle-orm";
import { ShopInsert, ShopPaymentOptionInsertData, paymentOptions, shops } from "../schema/shops";
import { db } from "./database";
import { cache } from "react";
import 'server-only'

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

export const queryUserShops = cache(async (userId: string) => {
  const result = await db.select().from(shops).where(eq(shops.ownerId, userId)).orderBy(asc(shops.name));
  return result;
});

export const queryShopById = cache(async (id: number) => {
  const result = await db.select().from(shops).where(eq(shops.id, id));
  if (result.length === 0) return null;
  return result[0];
});

export const queryShopDetails = cache(async (id: number) => {

  const result = await db.query.shops.findFirst({
    with: {itemCategories: true, paymentOptions: true},
    where: eq(shops.id, id),
  });

  return result;
});

export async function insertPaymentOption(data: ShopPaymentOptionInsertData) {
  const result = await db.insert(paymentOptions).values(data).onConflictDoNothing().returning();
  if (result.length === 0) return null;
  return result[0];
}
