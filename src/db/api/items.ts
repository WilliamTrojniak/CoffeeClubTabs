import { DBTransaction } from "./database";
import 'server-only'
import { ItemInsert, ItemOptionCategoryInsert, itemAddons, itemOptionCategories, itemOptionCategoryOptions, itemOptions, itemToCategories, itemVariantCategories, items } from "../schema/items";
import { and, asc, count, desc, eq, inArray, isNull, sql } from "drizzle-orm";
import { cache } from "react";


export async function insertItem(tx: DBTransaction, shopId: number, itemData: ItemInsert) {
  const result = await tx.insert(items).values({...itemData, shopId }).onConflictDoUpdate({
    target: [items.shopId, items.id],
    set: { // TODO Make dynamic
      name: sql`excluded.name`,
      basePrice: sql`excluded.base_price`,
    },
  }).returning();

  if (result.length !== 1) return null;
  return result[0];
}

export const queryItemsByShop = cache(async (tx: DBTransaction, shopId: number) => {
  const result = await tx.select().from(items).where(
    eq(items.shopId, shopId),
  );

  return result;
});

export const queryOptionItems = cache(async (tx: DBTransaction, shopId: number) => {
  const variantCountSq = tx.select({variantCount: count(itemVariantCategories.itemId).as('varCount'), itemId: itemVariantCategories.itemId}).from(itemVariantCategories).groupBy(itemVariantCategories.itemId).as('varCountSq');
  const optionCountSq = tx.select({optionCount: count(itemOptions.itemId).as('optionCount'), itemId: itemOptions.itemId}).from(itemOptions).groupBy(itemOptions.itemId).as('optionCountSq');
  const addonCountSq = tx.select({addonCount: count(itemAddons.itemId).as('addonCount'), itemId: itemAddons.itemId}).from(itemAddons).groupBy(itemAddons.itemId).as('addonCountSq');


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
        orderBy: [asc(itemToCategories.index)],
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
          itemId: false
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



