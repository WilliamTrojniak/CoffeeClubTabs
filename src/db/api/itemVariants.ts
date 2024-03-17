import { cache } from "react";
import { ItemVariantCategoryInsert, ItemVariantInsert, itemVariantCategories, itemVariants, items } from "../schema/items";
import { DBTransaction } from "./database";
import { and, eq, inArray, notInArray, sql } from "drizzle-orm";

export async function updateItemVariantCategories(tx: DBTransaction, shopId: number, itemId: number, variantCategoriesData: ItemVariantCategoryInsert[]) {
 
  const result = variantCategoriesData.length > 0 ? await tx.insert(itemVariantCategories).values(variantCategoriesData.map(c => ({...c, shopId, itemId}))).onConflictDoUpdate({
    target: [itemVariantCategories.shopId, itemVariantCategories.itemId, itemVariantCategories.id],
    set: {
      name: sql`excluded.name`,
      index: sql`excluded.index`
    }, // TODO Make dynamic
  }).returning() : [];

  // Remove any variants that were not inserted or updated
  const toKeep = result.map(cat => cat.id);
  if(toKeep.length > 0) {
    await tx.delete(itemVariantCategories).where(and(
      eq(itemVariantCategories.shopId, shopId),
      eq(itemVariantCategories.itemId, itemId),
      notInArray(itemVariantCategories.id, toKeep)));
  } else {
    await tx.delete(itemVariantCategories).where(and(
      eq(itemVariantCategories.shopId, shopId),
      eq(itemVariantCategories.itemId, itemId)));
  }
  
  return result;
}

export const queryItemVariantCategoryById = cache(async (tx: DBTransaction, itemVariantCategoryId: number) => {
  const result = await tx.select().from(itemVariantCategories).where(eq(itemVariantCategories.id, itemVariantCategoryId)).leftJoin(items, eq(items.id, itemVariantCategories.itemId));
  if (result.length === 0) return null;
  return result[0];
});

export async function updateItemVariantsOptions(tx: DBTransaction, shopId: number, itemId: number, categoryIds: number[], variants: ItemVariantInsert[][]) {

  const insertData = variants.flatMap((variants, index) => (variants.map(variant => ({...variant, shopId, itemId, categoryId: categoryIds[index]}))));

  const result = variants.length > 0 ? await tx.insert(itemVariants).values(insertData).onConflictDoUpdate({
    target: [itemVariants.shopId, itemVariants.itemId, itemVariants.categoryId, itemVariants.id],
    set: {
      // TODO Make dynamic
      name: sql`excluded.name`,
      price: sql`excluded.price`,
      index: sql`excluded.index`,
    },
  }).returning() : [];

  // Remove any options that were not updated or inserted
  const toKeep = result.map(cat => cat.id);
  if (toKeep.length > 0) {
    await tx.delete(itemVariants).where(and(
      eq(itemVariants.shopId, shopId),
      eq(itemVariants.itemId, itemId),
      inArray(itemVariants.categoryId, categoryIds),
      notInArray(itemVariants.id, toKeep),
    ));
  } else if(categoryIds.length > 0) {
    await tx.delete(itemVariants).where(and(
      eq(itemVariants.shopId, shopId),
      eq(itemVariants.itemId, itemId),
      inArray(itemVariants.categoryId, categoryIds),
    ));
  } else {
    await tx.delete(itemVariants).where(and(
      eq(itemVariants.shopId, shopId),
      eq(itemVariants.itemId, itemId),
    ))
  }

  return result;
}
