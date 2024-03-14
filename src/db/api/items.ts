import { db } from "./database";
import 'server-only'
import { ItemCategoriesInsert, ItemInsert, ItemOptionCategoryInsert, ItemVariantCategoryInsert, itemAddons, itemCategories, itemOptionCategories, itemOptionCategoryOptions, itemOptionCategoryOptionsRelations, itemOptions, itemToCategories, itemVariantCategories, items } from "../schema/items";
import { and, count, eq, inArray, isNull } from "drizzle-orm";
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

export const queryOptionItems = cache(async (shopId: number) => {
  const variantCountSq = db.select({variantCount: count(itemVariantCategories.parentItemId).as('varCount'), itemId: itemVariantCategories.parentItemId}).from(itemVariantCategories).groupBy(itemVariantCategories.parentItemId).as('varCountSq');
  const optionCountSq = db.select({optionCount: count(itemOptions.parentItemId).as('optionCount'), itemId: itemOptions.parentItemId}).from(itemOptions).groupBy(itemOptions.parentItemId).as('optionCountSq');
  const addonCountSq = db.select({addonCount: count(itemAddons.parentItemId).as('addonCount'), itemId: itemAddons.parentItemId}).from(itemAddons).groupBy(itemAddons.parentItemId).as('addonCountSq');


  const result = await db.select({id: items.id, name: items.name, shopId: items.shopId}).from(items)
                                  .leftJoin(variantCountSq, eq(items.id, variantCountSq.itemId))
                                  .leftJoin(optionCountSq, eq(items.id, optionCountSq.itemId))
                                  .leftJoin(addonCountSq, eq(items.id, optionCountSq.itemId))
                                  .where(and(eq(items.shopId, shopId), isNull(variantCountSq.variantCount), isNull(optionCountSq.optionCount), isNull(addonCountSq.addonCount)));

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
    columns: {
      shopId: false,
    },
    with: {
      shop: {
        columns : {
          id: true,
          ownerId: true,
        }
      },
      addons: {
        columns: {},
        with: { addonItem: true }
      },
      categories: {
        columns: {},
        with: {
          category: true,
        }
      },
      options: {
        columns: {},
        with: { 
          optionCategory: {
            columns: {
              shopId: false
            },
            with: {
              itemOptionCategoryOptions: {
                columns: {},
                with: {
                  optionItem: {
                    columns: {shopId: false},
                  }
                }
              }
            }
          } 
        }
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

export async function linkItemCategories(itemId: number, itemCategoryIds: number[], shopId: number) {
  if (itemCategoryIds.length === 0) return null;

  const linkData = itemCategoryIds.map(id => ({itemId, itemCategoryId: id, shopId}));
  await db.insert(itemToCategories).values(linkData).onConflictDoNothing();
}


// Remove a category tag from an item. If this is the last item under the category, deletes the category.
export async function removeItemCategoriesLink(itemId: number, categoryIds: number[], shopId: number) {
  if (categoryIds.length === 0) return null;
  return await db.transaction(async tx => {
    // Get the number of remaining items within each category
    const linkCount = await tx.select({count: count(itemToCategories.itemId), itemCategoryId: itemToCategories.itemCategoryId}).from(itemToCategories).where(and(eq(itemToCategories.shopId, shopId), inArray(itemToCategories.itemCategoryId, categoryIds))).groupBy(itemToCategories.itemCategoryId);

    // Delete any entries with the item ID and the specified categories
    const result = await tx.delete(itemToCategories).where(and(eq(itemToCategories.shopId, shopId), eq(itemToCategories.itemId, itemId), inArray(itemToCategories.itemCategoryId, categoryIds))).returning();

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


export async function insertItemOptionCategory(data: ItemOptionCategoryInsert) {
  const result = await db.insert(itemOptionCategories).values(data).returning();
  if (result.length === 0) return null;
  return result[0];
}

export const queryItemOptionCategories = cache(async (shopId: number) => {
  const result = await db.query.itemOptionCategories.findMany({
    where: eq(itemOptionCategories.shopId, shopId),
    with: {
      itemOptionCategoryOptions: {
        columns: {},
        with: {
          optionItem: true,
        }
      }
    }
  });

  return result;
});

export async function insertItemOptionCategoryOptions(optionCategoryId: number, itemIds: number[], shopId: number) {
  const result = await db.insert(itemOptionCategoryOptions).values(itemIds.map(itemId => ({optionCategoryId, shopId, optionItemId: itemId}))).returning();
  
  if(result.length === 0) return null;

  return result;
}

export async function removeItemOptionCategoryOptions(optionCategoryId: number, itemIds: number[], shopId: number) {
  const result = await db.delete(itemOptionCategoryOptions).where(and(eq(itemOptionCategoryOptions.shopId, shopId), eq(itemOptionCategoryOptions.optionCategoryId, optionCategoryId), inArray(itemOptionCategoryOptions.optionItemId, itemIds))).returning();
  return result;
}

export async function insertItemOption(itemId: number, optionCategoryId: number, shopId: number) {
  const result = await db.insert(itemOptions).values({parentItemId: itemId, optionCategoryId, shopId}).returning();
  return result;
}

export async function removeItemOption(itemId: number, optionCategoryId: number, shopId: number) {
  const result = await db.delete(itemOptions).where(and(eq(itemOptions.shopId, shopId), eq(itemOptions.optionCategoryId, optionCategoryId), eq(itemOptions.parentItemId, itemId))).returning();
  return result;
}

export async function removeItemOptionCategory(optionCategoryId: number, shopId: number) {
  const result = await db.delete(itemOptionCategories).where(and(eq(itemOptionCategories.id, optionCategoryId), eq(itemOptionCategories.shopId, shopId))).returning();
  return result;
}

