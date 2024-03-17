import { and, eq, notInArray, sql } from "drizzle-orm";
import { itemAddons } from "../schema/items";
import { DBTransaction } from "./database";

export async function updateItemAddons(tx: DBTransaction, shopId: number, itemId: number, addonIds: number[]) {

  const result = addonIds.length > 0 ? await tx.insert(itemAddons).values(addonIds.map(addonId => ({addonId, shopId, itemId}))).onConflictDoUpdate({
    target: [itemAddons.shopId, itemAddons.itemId, itemAddons.addonId],
    set:  {
      index: sql`excluded.index`,
    }
  }).returning() : [];

  const toKeep = result.map(entry => entry.id);
  if(toKeep.length > 0) {
    await tx.delete(itemAddons).where(and(
      eq(itemAddons.shopId, shopId),
      eq(itemAddons.itemId, itemId),
      notInArray(itemAddons.addonId, toKeep),
    ));
  } else {
    await tx.delete(itemAddons).where(and(
      eq(itemAddons.shopId, shopId),
      eq(itemAddons.itemId, itemId)
    ));
  }

  return result;
}
