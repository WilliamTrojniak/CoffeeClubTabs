import { and, eq, notInArray } from "drizzle-orm";
import { itemAddons } from "../schema/items";
import { DBTransaction } from "./database";

export async function updateItemAddons(tx: DBTransaction, shopId: number, parentItemId: number, addonItemIds: number[]) {

  const result = addonItemIds.length > 0 ? await tx.insert(itemAddons).values(addonItemIds.map(addonItemId => ({addonItemId, parentItemId, shopId}))).onConflictDoUpdate({
    target: [itemAddons.addonItemId, itemAddons.parentItemId],
    set: {shopId},
    where: eq(itemAddons.shopId, shopId),
  }).returning() : [];

  if(result.length > 0) {
    await tx.delete(itemAddons).where(and(
      notInArray(itemAddons.addonItemId, result.map(option => option.addonItemId)),
      eq(itemAddons.parentItemId, parentItemId),
      eq(itemAddons.shopId, shopId)
    ));
  } else {
    await tx.delete(itemAddons).where(and(
      eq(itemAddons.parentItemId, parentItemId),
      eq(itemAddons.shopId, shopId)
    ));
  }

}
