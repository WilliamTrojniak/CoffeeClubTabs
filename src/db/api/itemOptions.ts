import { cache } from "react";
import { DBTransaction } from "./database";
import { and, eq, inArray, notInArray, sql } from "drizzle-orm";
import { ItemOptionCategoryInsert, itemOptionCategories, itemOptionCategoryOptions, itemOptions } from "../schema/items";

export const queryItemOptionCategories = cache(async (tx: DBTransaction, shopId: number) => {
  const result = await tx.query.itemOptionCategories.findMany({
    where: eq(itemOptionCategories.shopId, shopId),
    with: {
      options: {
        columns: {},
        with: {
          optionItem: true,
        }
      }
    }
  });

  return result;
});

export async function updateItemOptionCategories(tx: DBTransaction, shopId: number, optionCategories: ItemOptionCategoryInsert[]) {

  const result = optionCategories.length > 0 ? await tx.insert(itemOptionCategories).values(optionCategories.map(category => ({...category, shopId}))).onConflictDoUpdate({
    target: [itemOptionCategories.shopId, itemOptionCategories.id], 
    set: {
      name: sql`excluded.name`,
      index: sql`excluded.index`,
    }, // TODO Make dynamic
  }).returning() : [];


  // Remove any options that were not included
  const toKeep = result.map(entry => entry.id);
  if(toKeep.length > 0) {
    await tx.delete(itemOptionCategories).where(and(
      eq(itemOptionCategories.shopId, shopId),
      notInArray(itemOptionCategories.id, toKeep),
    ));
  } else {
    await tx.delete(itemOptionCategories).where(
      eq(itemOptionCategories.shopId, shopId));
  }

  return result;

}

export async function updateItemOptionsOptions(tx: DBTransaction, shopId: number, optionCategoryIds: number[], optionItemIds: number[][]) {
  if(optionItemIds.length !== optionCategoryIds.length) throw new Error("Must provide category for all options");

  const insertData = optionItemIds.flatMap((itemIds, index) => itemIds.map(itemId => ({itemId, shopId, categoryId: optionCategoryIds[index]})));

  const result = insertData.length > 0 ? await tx.insert(itemOptionCategoryOptions).values(insertData).onConflictDoUpdate({
    target: [itemOptionCategoryOptions.shopId, itemOptionCategoryOptions.categoryId, itemOptionCategoryOptions.itemId],
    set: { // TODO Make dynamic
      index: sql`excluded.index`,
    },
  }).returning() : [];

  // Remove any options that were not updated or inserted
  const toKeep = result.map(entry => entry.id);
  if(toKeep.length > 0) {
    await tx.delete(itemOptionCategoryOptions).where(and(
      eq(itemOptionCategoryOptions.shopId, shopId),
      inArray(itemOptionCategoryOptions.categoryId, optionCategoryIds),
      notInArray(itemOptionCategoryOptions.id, toKeep),
    ));
  } else if (optionCategoryIds.length > 0) {
    await tx.delete(itemOptionCategoryOptions).where(and(
      eq(itemOptionCategoryOptions.shopId, shopId),
      inArray(itemOptionCategoryOptions.categoryId, optionCategoryIds),
    ));
  } else {
    await tx.delete(itemOptionCategoryOptions).where(
      eq(itemOptionCategoryOptions.shopId, shopId)
    );

  }

  return result;
}

export async function updateItemOptions(tx: DBTransaction, shopId: number, itemId: number, optionIds: number[]) {
  const result = optionIds.length > 0 ? await tx.insert(itemOptions).values(optionIds.map(optionId => ({optionId, shopId, itemId}))).onConflictDoUpdate({
    target: [itemOptions.shopId, itemOptions.optionId, itemOptions.optionId],
    set: { // TODO Make dynamic
      index: sql`excluded.index`,
    },
  }).returning() : [];

  const toKeep = result.map(entry => entry.id);
  if(result.length > 0) {
    await tx.delete(itemOptions).where(and(
      eq(itemOptions.shopId, shopId),
      eq(itemOptions.itemId, itemId),
      notInArray(itemOptions.optionId, toKeep),
    ));
  } else {
    await tx.delete(itemOptions).where(and(
      eq(itemOptions.shopId, shopId),
      eq(itemOptions.itemId, itemId)
    ));
  }

  return result;

}

