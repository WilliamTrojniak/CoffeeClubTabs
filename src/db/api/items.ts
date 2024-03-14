import { db } from "./database";
import 'server-only'
import { ItemCategoriesInsert, ItemCategory, ItemInsert, ItemVariantCategoryInsert, itemCategories, itemCategoriesInsertSchema, itemCategoriesRelations, itemToCategories, itemVariantCategories, items } from "../schema/items";
import { and, count, countDistinct, eq, inArray } from "drizzle-orm";
import { cache } from "react";
import { link } from "fs";

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
      categories: {
        columns: {
          id: true,
        },
        with: {
          category: true,
        }
      },
      options: {
        columns: {},
        with: { optionItem: true }
      },
      variants: { 
        with: {
          variantOptions: true
        }
      },
    },
  });
  if (!result) return null; // Undefined -> null for consistency
  return result;
});

export async function insertItemCategories(data: ItemCategoriesInsert[]) {
  if (data.length === 0) return;
  const result = await db.insert(itemCategories).values(data).onConflictDoNothing().returning();
  if (result.length === 0) return null;
  return result;
}

export async function queryItemCategoriesById(categoryIds: number[]) {
  if (categoryIds.length === 0) return null;
  const result = await db.select().from(itemCategories).where(inArray(itemCategories.id, categoryIds));
  if (result.length === 0) return null;
  return result;
}

export async function linkItemCategories(itemId: number, itemCategoryIds: number[]) {
  if (itemCategoryIds.length === 0) return null;

  const linkData = itemCategoryIds.map(id => ({itemId, itemCategoryId: id}));
  await db.insert(itemToCategories).values(linkData).onConflictDoNothing();
}


// Remove a category tag from an item. If this is the last item under the category, deletes the category.
export async function removeItemCategoriesLink(itemId: number, categoryIds: number[]) {
  if (categoryIds.length === 0) return null;
  return await db.transaction(async tx => {
    // Get the number of remaining items within each category
    const linkCount = await tx.select({count: count(itemToCategories.itemId), itemCategoryId: itemToCategories.itemCategoryId}).from(itemToCategories).where(inArray(itemToCategories.itemCategoryId, categoryIds)).groupBy(itemToCategories.itemCategoryId);

    // Delete any entries with the item ID and the specified categories
    const result = await tx.delete(itemToCategories).where(and(eq(itemToCategories.itemId, itemId), inArray(itemToCategories.itemCategoryId, categoryIds))).returning();

    // i.e. if nothing was deleted, do nothing
    if (result.length === 0) return null;
    

    // Get the categories with only one connection before deletion (now zero)
    const emptyCategoryIds = linkCount.filter(link => link.count === 1).map(link => link.itemCategoryId);
    
    // Delete all empty categories
    if (emptyCategoryIds.length > 0)
      await tx.delete(itemCategories).where(inArray(itemCategories.id, emptyCategoryIds));

    return result;
  });

}
