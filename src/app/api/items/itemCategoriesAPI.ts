import { db } from "@/db/api/database";
import { ItemCategoriesInsert, itemCategoriesInsertSchema } from "@/db/schema/items";
import { z } from "zod";
import { clientFormattingErrorResponse, internalServerErrorReponse } from "../responses";
import { modifyShop } from "../shops/shopsAPI";
import { queryItemById } from "@/db/api/items";
import { insertAndSetItemCategories } from "@/db/api/itemCategories";


export async function createAndSetItemCategories(itemId: number, categoryData: ItemCategoriesInsert[]) {
  const parsedItem = z.number().int().min(1).safeParse(itemId);
  const parsedCategoryData = itemCategoriesInsertSchema.array().safeParse(categoryData);

  if(!parsedItem.success) return clientFormattingErrorResponse(parsedItem.error.format());
  if(!parsedCategoryData.success) return clientFormattingErrorResponse(parsedCategoryData.error.format());

  if(categoryData.length === 0) return null;

  try {
    return await db.transaction(async tx => {
      const shopId = await queryItemById(tx, itemId).then(i => i?.id);
      return await modifyShop(tx, shopId, async (tx, shopId) => {
        await insertAndSetItemCategories(tx, parsedItem.data, parsedCategoryData.data, shopId);
      });
    });
  } catch (e) {
    console.log(e);
    return internalServerErrorReponse();
  }
}
  
