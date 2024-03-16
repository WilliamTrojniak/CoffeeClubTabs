import { DBTransaction } from "./database";
import 'server-only'
import { ItemInsert, ItemOptionCategoryInsert, itemAddons, itemOptionCategories, itemOptionCategoryOptions, itemOptions, itemVariantCategories, items } from "../schema/items";
import { and, count, eq, inArray, isNull, sql } from "drizzle-orm";
import { cache } from "react";


export async function insertItem(tx: DBTransaction, data: ItemInsert) {
  const result = await tx.insert(items).values({
    ...data,
    basePrice: parseFloat(data.basePrice.toFixed(2))
  }).onConflictDoUpdate({
    target: items.id,
    set: {
      name: sql`excluded.name`,
      basePrice: sql`excluded.base_price`,
    },
    where: eq(items.shopId, data.shopId)
  }).returning();

  if (result.length !== 1) return null;
  return result[0];
}

export const queryItemsByShop = cache(async (tx: DBTransaction, shopId: number) => {
  const result = await tx.query.items.findMany({
    where: eq(items.shopId, shopId),
  });
  return result;
});

export const queryOptionItems = cache(async (tx: DBTransaction, shopId: number) => {
  const variantCountSq = tx.select({variantCount: count(itemVariantCategories.parentItemId).as('varCount'), itemId: itemVariantCategories.parentItemId}).from(itemVariantCategories).groupBy(itemVariantCategories.parentItemId).as('varCountSq');
  const optionCountSq = tx.select({optionCount: count(itemOptions.parentItemId).as('optionCount'), itemId: itemOptions.parentItemId}).from(itemOptions).groupBy(itemOptions.parentItemId).as('optionCountSq');
  const addonCountSq = tx.select({addonCount: count(itemAddons.parentItemId).as('addonCount'), itemId: itemAddons.parentItemId}).from(itemAddons).groupBy(itemAddons.parentItemId).as('addonCountSq');


  const result = await tx.select({id: items.id, name: items.name, shopId: items.shopId, basePrice: items.basePrice}).from(items)
                                  .leftJoin(variantCountSq, eq(items.id, variantCountSq.itemId))
                                  .leftJoin(optionCountSq, eq(items.id, optionCountSq.itemId))
                                  .leftJoin(addonCountSq, eq(items.id, optionCountSq.itemId))
                                  .where(and(eq(items.shopId, shopId), isNull(variantCountSq.variantCount), isNull(optionCountSq.optionCount), isNull(addonCountSq.addonCount)));

  return result;
});


export const queryItemById = cache(async (tx: DBTransaction, itemId: number) => {
  const result = await tx.query.items.findFirst({
    where: eq(items.id, itemId),
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
            with: {
              options: {
                columns: {},
                with: {
                  optionItem: true, 
                }
              }
            }
          } 
        }
      },
      variants: { 
        columns: {
          parentItemId: false
        },
        with: {
          variantOptions: {
            orderBy: (itemVariants, {asc}) => [asc(itemVariants.index)]
          }
        }
      },
    },
  });
  if (!result) return null; // Undefined -> null for consistency
  return result;
});



