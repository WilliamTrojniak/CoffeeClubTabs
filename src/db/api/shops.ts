import { asc, eq } from "drizzle-orm";
import { Shop, ShopInsert, ShopPaymentOption, ShopPaymentOptionInsertData, paymentOptions, shops } from "../schema/shops";
import { db } from "./database";
import { cache } from "react";
import 'server-only'
import { ItemCategory, itemCategories } from "../schema/items";

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
  const rows = await db.select().from(shops).leftJoin(paymentOptions, eq(shops.id, paymentOptions.shopId)).leftJoin(itemCategories, eq(shops.id, itemCategories.shopId)).where(eq(shops.id, id));

  if(rows.length === 0) return null;
  const result = rows.reduce<{shop_data: Shop, item_categories: ItemCategory[], payment_options: ShopPaymentOption[]}>((prev, row) => {
    if (row.item_categories) prev.item_categories.push(row.item_categories);
    if (row.payment_options) prev.payment_options.push(row.payment_options);
    return prev;
  }, {shop_data: rows[0].shops, item_categories: [], payment_options: []});

  return result;
});

export async function insertPaymentOption(data: ShopPaymentOptionInsertData) {
  const result = await db.insert(paymentOptions).values(data).onConflictDoNothing().returning();
  if (result.length === 0) return null;
  return result[0];
}
