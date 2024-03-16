import { ItemVariantCategoryInsert, ItemVariantInsert, itemVariantCategoryInsertSchema, itemVariantInsertSchema } from "@/db/schema/items";
import { clientFormattingErrorResponse, internalServerErrorReponse, notFoundResponse } from "../responses";
import { queryItemById } from "@/db/api/items";
import { db } from "@/db/api/database";
import { z } from "zod";
import { modifyShop } from "../shops/shopsAPI";
import { queryItemVariantCategoryById, updateItemVariantCategories, updateItemVariantOptions } from "@/db/api/itemVariants";

export async function setItemVariantCategories(data: ItemVariantCategoryInsert[], itemId: number) {

  const parsed = itemVariantCategoryInsertSchema.array().safeParse(data);
  const parsedItemId = z.number().int().min(1).safeParse(itemId);

  if(!parsedItemId.success) return notFoundResponse();

  if (!parsed.success)
    return clientFormattingErrorResponse(parsed.error.format());

  try {
    return await db.transaction(async tx => {
      const shopId = (await queryItemById(tx, parsedItemId.data))?.shop.id;
      return await modifyShop(tx, shopId, async (tx) => {
        return await updateItemVariantCategories(tx, parsed.data.map(v => ({...v, parentItemId: parsedItemId.data})), parsedItemId.data);

      });
    });
  } catch (e) {
    console.log(e);
    return internalServerErrorReponse();
  }
}

export async function createItemVariantOption(data: ItemVariantInsert[], variantCategoryId: number) {
  const parsedData = itemVariantInsertSchema.array().safeParse(data);
  const parsedCategoryId = z.number().int().min(1).safeParse(variantCategoryId);

  if(!parsedCategoryId.success) return notFoundResponse();
  if(!parsedData.success) return clientFormattingErrorResponse(parsedData.error.format());

  try {
    return await db.transaction(async tx => {
      const shopId = await queryItemVariantCategoryById(tx, variantCategoryId).then(data => data?.items?.shopId);
      return await modifyShop(tx, shopId, (tx) => updateItemVariantOptions(tx, parsedData.data.map(v => ({...v, categoryId: parsedCategoryId.data})), parsedCategoryId.data));
    });
    
  } catch (e) {
    console.log(e);
    return internalServerErrorReponse();
  }

}
