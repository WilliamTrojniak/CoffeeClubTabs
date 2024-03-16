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

export async function updateItemOptionCategories(tx: DBTransaction, OptionCategories: ItemOptionCategoryInsert[], shopId: number) {

  const result = await tx.insert(itemOptionCategories).values(OptionCategories.map(entry => ({...entry, shopId}))).onConflictDoUpdate({
    target: itemOptionCategories.id,
    set: {name: sql`excluded.name`}, // TODO Make dynamic
    where: eq(itemOptionCategories.shopId, shopId)
  }).returning();


  // Remove any options that were not included
  const toKeep = result.map(entry => entry.id);
  if(toKeep.length > 0) {
    await tx.delete(itemOptionCategories).where(and(
      notInArray(itemOptionCategories.id, toKeep),
      eq(itemOptionCategories.shopId, shopId)
    ));
  } else {
    await tx.delete(itemOptionCategories).where(
      eq(itemOptionCategories.shopId, shopId));
  }

  return result;

}

export async function updateItemOptionsOptions(tx: DBTransaction, optionItemIds: number[][], optionCategoryIds: number[], shopId: number) {
  if(optionItemIds.length !== optionCategoryIds.length) throw new Error("Must provide category for all options");

  const insertData = optionItemIds.flatMap((itemIds, index) => itemIds.map(optionItemId => ({optionItemId, optionCategoryId: optionCategoryIds[index], shopId})));

  const result = insertData.length > 0 ? await tx.insert(itemOptionCategoryOptions).values(insertData).onConflictDoUpdate({
    target: [itemOptionCategoryOptions.optionItemId, itemOptionCategoryOptions.optionCategoryId],
    set: {shopId},
    where: eq(itemOptionCategoryOptions.shopId, shopId)
  }).returning() : [];

  // Remove any options that were not updated or inserted
  for (let i = 0; i < optionItemIds.length; i++) {
    const optionItems = optionItemIds[i];
    const optionCategoryId = optionCategoryIds[i];
    if(optionItems.length === 0) {
      await tx.delete(itemOptionCategoryOptions).where(and(
        eq(itemOptionCategoryOptions.optionCategoryId, optionCategoryId),
        eq(itemOptionCategoryOptions.shopId, shopId),
      ));
    } else {
      await tx.delete(itemOptionCategoryOptions).where(and(
        notInArray(itemOptionCategoryOptions.optionItemId, optionItems),
        eq(itemOptionCategoryOptions.optionCategoryId, optionCategoryId),
        eq(itemOptionCategoryOptions.shopId, shopId)
      ));
    }
  }
   

  return result;
}

export async function updateItemOptions(tx: DBTransaction, shopId: number, parentItemId: number, optionCategoryIds: number[]) {
  const result = optionCategoryIds.length > 0 ? await tx.insert(itemOptions).values(optionCategoryIds.map(optionCategoryId => ({optionCategoryId, parentItemId, shopId}))).onConflictDoUpdate({
    target: [itemOptions.optionCategoryId, itemOptions.parentItemId],
    set: {shopId},
    where: eq(itemOptions.shopId, shopId),
  }).returning() : [];

  if(result.length > 0) {
    await tx.delete(itemOptions).where(and(
      notInArray(itemOptions.optionCategoryId, result.map(option => option.optionCategoryId)),
      eq(itemOptions.parentItemId, parentItemId),
      eq(itemOptions.shopId, shopId)
    ));
  } else {
    await tx.delete(itemOptions).where(and(
      eq(itemOptions.parentItemId, parentItemId),
      eq(itemOptions.shopId, shopId)
    ));
  }

}

