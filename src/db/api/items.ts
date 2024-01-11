import { db } from "./database";
import 'server-only'
import { ItemCategoriesInsert, ItemInsert, ItemVariantCategoryInsert, itemCategories, itemVariantCategories, items } from "../schema/items";
import { eq } from "drizzle-orm";
import { cache } from "react";

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

export const queryItemsByShop = cache(async (shopId: number) => {
  const result = await db.query.items.findMany({
    where: eq(items.shopId, shopId),
  });
  return result;
});

export async function insertItemVariantCategory(data: ItemVariantCategoryInsert) {
  const result = await db.insert(itemVariantCategories).values(data).onConflictDoNothing().returning();
  if (result.length === 0) return null;
  return result[0];
}

export const queryItemById = cache(async (itemId: number) => {
  const result = await db.query.items.findFirst({
    where: eq(items.id, itemId),
    with: {
      shop: {
        columns : {
          ownerId: true,
        }
      },
      addons: {
        columns: {},
        with: { addonItem: true }
      },
      categories: true,
      options: {
        columns: {},
        with: { optionItem: true }
      },
      variants: { 
        with: {
          category: true
        }
      },
    },
  });
  if (!result) return null; // Undefined -> null for consistency
  return result;
});


