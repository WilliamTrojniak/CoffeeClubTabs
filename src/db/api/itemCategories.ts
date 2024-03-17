import { cache } from "react";
import { ItemCategoriesInsert, ItemCategory, itemCategories, itemToCategories } from "../schema/items";
import { DBTransaction } from "./database";
import { and, eq, inArray, notInArray, sql } from "drizzle-orm";

export const getItemCategoryShopIds = cache(async (tx: DBTransaction, categoryIds: number[]) => {
  const result = await queryItemCategoriesById(tx, categoryIds);
  return result.map(c => c.shopId);
});

export const queryItemCategoriesById = cache(async (tx: DBTransaction, categoryIds: number[]) => {
  if (categoryIds.length === 0) return [];
  const result = await tx.select().from(itemCategories).where(inArray(itemCategories.id, categoryIds));
  return result;
});

export const queryItemCategoriesByShopId = cache(async (tx: DBTransaction, shopId: number) => {
  const result = await tx.query.itemCategories.findMany({
    where: eq(itemCategories.shopId, shopId),
  });

  return result;
});

export async function insertItemCategories(tx: DBTransaction, shopId: number, categoryData: ItemCategoriesInsert[]) {
  if (categoryData.length === 0) return [];
  const result = await tx.insert(itemCategories).values(categoryData.map(category => ({...category, shopId}))).onConflictDoUpdate({
    target: [itemCategories.shopId, itemCategories.id],
    set: {
      name: sql`excluded.name`,
      index: sql`excluded.index`,
    }
  }).returning();

  return result;
}

export async function setItemCategories(tx: DBTransaction, shopId: number, itemId: number, categoryIds: number[]) {

  const linkData = categoryIds.map(categoryId => ({shopId, itemId, categoryId}));
  await tx.transaction(async subtx => {

    // First, add any new item categories to the item
    const result = categoryIds.length > 0 ? await subtx.insert(itemToCategories).values(linkData).onConflictDoUpdate({
      target: [itemToCategories.shopId, itemToCategories.itemId, itemToCategories.categoryId],
      set: {
        index: sql`excluded.index` // TODO Make dynamic
      }
    }).returning() : [];

    // Next, delete any item categories no longer associated with the item
    if (categoryIds.length > 0) {
     await subtx.delete(itemToCategories).where(and(
        eq(itemToCategories.shopId, shopId),
        eq(itemToCategories.itemId, itemId),
        notInArray(itemToCategories.categoryId, categoryIds)
      ));
    } 
    else
      await subtx.delete(itemToCategories).where(and(
        eq(itemToCategories.shopId, shopId),
        eq(itemToCategories.itemId, itemId),
      )); 
      

    // Finally remove any item categories that no longer have any references
    await subtx.execute(sql`DELETE FROM ${itemCategories} WHERE NOT EXISTS (SELECT FROM ${itemToCategories} WHERE ${itemToCategories.categoryId} = ${itemCategories.id})`);
    return result;
  });
}

export async function insertAndSetItemCategories(tx: DBTransaction, shopId: number, itemId: number, categoryData: ItemCategoriesInsert[]) {
    const updatedCategories = await insertItemCategories(tx, shopId, categoryData); 

    await setItemCategories(tx, shopId, itemId, updatedCategories.map(c => c.id));
}
