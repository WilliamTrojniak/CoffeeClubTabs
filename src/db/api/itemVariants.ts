import { cache } from "react";
import { ItemVariantCategoryInsert, ItemVariantInsert, itemVariantCategories, itemVariants, items } from "../schema/items";
import { DBTransaction } from "./database";
import { and, eq, notInArray, sql } from "drizzle-orm";

export async function updateItemVariantCategories(tx: DBTransaction, data: ItemVariantCategoryInsert[], parentItemId: number) {
  const result = await tx.insert(itemVariantCategories).values(data).onConflictDoUpdate({
    target: itemVariantCategories.id,
    set: {name: sql`excluded.name`, index: sql`excluded.index`},
    where: eq(itemVariantCategories.parentItemId, parentItemId)
  }).returning();

  // Remove any variants that were not inserted or updated
  await tx.delete(itemVariantCategories).where(and(
    notInArray(itemVariantCategories.id, result.map(v => v.id)), 
    eq(itemVariantCategories.parentItemId, parentItemId)));

  return result;
}

export const queryItemVariantCategoryById = cache(async (tx: DBTransaction, itemVariantCategoryId: number) => {
  const result = await tx.select().from(itemVariantCategories).where(eq(itemVariantCategories.id, itemVariantCategoryId)).leftJoin(items, eq(items.id, itemVariantCategories.parentItemId));
  if (result.length === 0) return null;
  return result[0];
});

export async function updateItemVariantOptions(tx: DBTransaction, data: ItemVariantInsert[], categoryId: number) {
  const result = await tx.insert(itemVariants).values(data).onConflictDoUpdate({
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
