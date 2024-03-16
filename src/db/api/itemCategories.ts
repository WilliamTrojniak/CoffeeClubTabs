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

export async function insertItemCategories(tx: DBTransaction, data: ItemCategoriesInsert[]) {
  if (data.length === 0) return [];
  const result = await tx.insert(itemCategories).values(data).onConflictDoNothing().returning();

  return result;
}

export async function setItemCategories(tx: DBTransaction, itemId: number, itemCategoryIds: number[], shopId: number) {
  if (itemCategoryIds.length === 0) return null;

  const linkData = itemCategoryIds.map(id => ({itemId, itemCategoryId: id, shopId}));
  await tx.transaction(async subtx => {

    // First, add any new item categories to the item
    if(linkData.length > 0)
      await subtx.insert(itemToCategories).values(linkData).onConflictDoNothing();

    // Next, delete any item categories no longer associated with the item
    await subtx.delete(itemToCategories).where(and(
      eq(itemToCategories.shopId, shopId),
      eq(itemToCategories.itemId, itemId),
      notInArray(itemToCategories.itemCategoryId, itemCategoryIds)
    )); 

    // Finally remove any item categories that no longer have any references
    await subtx.execute(sql`delete * from ${itemCategories} left join ${itemToCategories} on ${itemCategories.id} = ${itemToCategories.itemCategoryId} where ${itemToCategories.itemCategoryId} is null`);
  });
}

export async function insertAndSetItemCategories(tx: DBTransaction, itemId: number, itemCategoryData: ItemCategoriesInsert[], shopId: number) {
    const existingCategories = itemCategoryData.filter((i): i is ItemCategory => !!i.id);
    const nonExistingCategories = itemCategoryData.filter(i => !i.id);

    const newCategories = await insertItemCategories(tx, nonExistingCategories.map(i => ({...i, shopId}))) // Overwrite shopId

    const toLink = newCategories ? newCategories.concat(existingCategories) : existingCategories;
    await setItemCategories(tx, itemId, toLink.map(c => c.id), shopId);
}
