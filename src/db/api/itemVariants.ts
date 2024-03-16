import { cache } from "react";
import { ItemCategory, ItemVariantCategoryInsert, ItemVariantInsert, itemVariantCategories, itemVariantCategoryInsertSchema, itemVariants, items } from "../schema/items";
import { DBTransaction } from "./database";
import { and, eq, inArray, notInArray, sql } from "drizzle-orm";

export async function updateItemVariantCategories(tx: DBTransaction, parentItemId: number, data: ItemVariantCategoryInsert[]) {
 
  const result = await tx.insert(itemVariantCategories).values(data.map(entry => ({...entry, parentItemId: parentItemId}))).onConflictDoUpdate({
    target: itemVariantCategories.id,
    set: {name: sql`excluded.name`, index: sql`excluded.index`}, // TODO Make dynamic
    where: eq(itemVariantCategories.parentItemId, parentItemId)
  }).returning();

  // Remove any variants that were not inserted or updated
  const toKeep = result.map(cat => cat.id);
  if(toKeep.length > 0)
    await tx.delete(itemVariantCategories).where(and(
      notInArray(itemVariantCategories.id, toKeep),
      eq(itemVariantCategories.parentItemId, parentItemId)));
  else
    await tx.delete(itemVariants).where(
      eq(itemVariantCategories.parentItemId, parentItemId));

  return result;
}

export const queryItemVariantCategoryById = cache(async (tx: DBTransaction, itemVariantCategoryId: number) => {
  const result = await tx.select().from(itemVariantCategories).where(eq(itemVariantCategories.id, itemVariantCategoryId)).leftJoin(items, eq(items.id, itemVariantCategories.parentItemId));
  if (result.length === 0) return null;
  return result[0];
});

export async function updateItemVariantOptions(tx: DBTransaction, data: ItemVariantInsert[], categoryId: number) {
  const result = await tx.insert(itemVariants).values(data.map(data => ({...data, categoryId}))).onConflictDoUpdate({
    target: itemVariants.id,
    set: {
      name: sql`excluded.name`,
      price: sql`excluded.price`,
      index: sql`excluded.index`,
    },
    where: eq(itemVariants.categoryId, categoryId)
  }).returning();

  // Remove any options that were not updated or inserted
  await tx.delete(itemVariants).where(and(
    notInArray(itemVariants.id, result.map(v => v.id)),
    eq(itemVariants.categoryId, categoryId)
  ));

  return result;
}


export async function updateItemVariantsOptions(tx: DBTransaction, data: ItemVariantInsert[][], categoryIds: number[]) {

  if (data.length !== categoryIds.length) throw new Error("Must provide category for all options");
  
  const insertData = data.flatMap((variants, index) => (variants.map(variant => ({...variant, categoryId: categoryIds[index]}))));


  const result = await tx.insert(itemVariants).values(insertData).onConflictDoUpdate({
    target: itemVariants.id,
    set: {
      name: sql`excluded.name`,
      price: sql`excluded.price`,
      index: sql`excluded.index`,
    },
    where: eq(itemVariants.categoryId, sql`excluded.category`)
  }).returning();

  // Remove any options that were not updated or inserted
  if(result.length > 0 && categoryIds.length > 0) {
    await tx.delete(itemVariants).where(and(
      notInArray(itemVariants.id, result.map(v => v.id)),
      inArray(itemVariants.categoryId, categoryIds)
    ));
  }

  return result;
}

