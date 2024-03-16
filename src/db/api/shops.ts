import { asc, eq } from "drizzle-orm";
import { ShopInsert, ShopPaymentOptionInsertData, paymentOptions, shops } from "../schema/shops";
import { DBTransaction } from "./database";
import { cache } from "react";
import 'server-only'

export async function insertShop(tx: DBTransaction, data: ShopInsert) {
  const result = await tx.insert(shops).values({ownerId: data.ownerId, name: data.name}).onConflictDoNothing().returning();
  if (result.length === 0) return null;
  return result[0];
}

export async function removeShop(tx: DBTransaction, shopId: number) {
  const result = await tx.delete(shops).where(eq(shops.id, shopId)).returning();
  if (result.length === 0) return null;
  return result[0];
}

export const queryUserShops = cache(async (tx: DBTransaction, userId: string) => {
  const result = await tx.select().from(shops).where(eq(shops.ownerId, userId)).orderBy(asc(shops.name));
  return result;
});

export const queryShopById = cache(async (tx: DBTransaction, id: number) => {
  const result = await tx.select().from(shops).where(eq(shops.id, id));
  if (result.length === 0) return null;
  return result[0];
});

export const queryShopDetails = cache(async (tx: DBTransaction, id: number) => {

  const result = await tx.query.shops.findFirst({
    with: {itemCategories: true, paymentOptions: true},
    where: eq(shops.id, id),
  });
  if (!result) return null; // for consistency
  return result;
});

export async function insertPaymentOption(tx: DBTransaction, data: ShopPaymentOptionInsertData) {
  const result = await tx.insert(paymentOptions).values(data).onConflictDoNothing().returning();
  if (result.length === 0) return null;
  return result[0];
}
