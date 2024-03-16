'use server'

import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { Item, ItemCategoriesInsert, ItemInsert, ItemOptionCategoryInsert, ItemVariantCategoryInsert, ItemVariantInsert, itemCategoriesInsertSchema, itemInsertSchema, itemOptionCategoryInsertSchema, itemVariantCategories, itemVariantCategoryInsertSchema, itemVariantCategorySchema, itemVariantInsertSchema, itemVariants } from "@/db/schema/items";
import { Response, clientFormattingErrorResponse, generalClientSuccess, internalServerErrorReponse, notFoundResponse, unauthenticatedResponse, unauthorizedResponse } from "../responses";
import { insertItem, insertItemOption, insertItemOptionCategory, insertItemOptionCategoryOptions, queryItemById, queryItemOptionCategories, queryItemsByShop, queryOptionItems, removeItemOption, removeItemOptionCategory, removeItemOptionCategoryOptions } from "@/db/api/items";
import { z } from "zod";
import { modifyShop } from "../shops/shopsAPI";
import { db } from "@/db/api/database";
import { insertAndSetItemCategories, insertItemCategories } from "@/db/api/itemCategories";
import { revalidatePath } from "next/cache";
import ItemVariantOptionsInput from "@/components/ItemCreateForms/ItemVariantForm/ItemVariantOptionsInput";
import { updateItemVariantCategories, updateItemVariantOptions, updateItemVariantsOptions } from "@/db/api/itemVariants";

export type ItemUpdateData = {
  item: ItemInsert,
  itemCategories: ItemCategoriesInsert[],
  itemVariants: (ItemVariantCategoryInsert & {variantOptions: ItemVariantInsert[]})[],
}


export async function updateItem(data: ItemUpdateData) {

  const schema = z.object({
    item: itemInsertSchema,
    itemCategories: itemCategoriesInsertSchema.array(),
    itemVariants: itemVariantCategoryInsertSchema.merge(z.object({variantOptions: itemVariantInsertSchema.array()})).array().transform(
      itemVariantArr => {
        return itemVariantArr.reduce<{categories: ItemVariantCategoryInsert[], options: ItemVariantInsert[][]}>((accumulator, itemVariant) => {
          accumulator.categories.push({
            id: itemVariant.id, 
            index: itemVariant.index, 
            name: itemVariant.name,
          });
          accumulator.options.push(itemVariant.variantOptions);
          return accumulator;
        }, {categories: [], options: []})
      }
    ),
  });

  const parsed = schema.safeParse(data);

  if(!parsed.success)
    return clientFormattingErrorResponse(parsed.error.format());

  console.log(parsed.data);
  
  const result = await db.transaction(async tx => {
    return await modifyShop(tx, parsed.data.item.shopId, async (tx, shopId) => {
      // TODO Fix authorization
      const itemData = await insertItem(tx, parsed.data.item);
      if (!itemData) {
        tx.rollback();
        return;
      }
      
      const itemCategoriesData = await insertAndSetItemCategories(tx, itemData.id, parsed.data.itemCategories.map(data => ({...data, shopId})), parsed.data.item.shopId);

      // Set item variant categories and add their options
      await tx.transaction(async tx => {
        const itemVariantCategoriesData = await updateItemVariantCategories(tx, itemData.id, parsed.data.itemVariants.categories);
        if (itemVariantCategoriesData.length !== parsed.data.itemVariants.categories.length) {
          tx.rollback();
          return
        }
        const itemVariantsData = await updateItemVariantsOptions(tx, parsed.data.itemVariants.options, itemVariantCategoriesData.map(cat => cat.id));
      });

      return itemData;
    });
  });


  return result;
}


export async function getItemsByShopId(shopId: number): Promise<Response<Item[]>> {
  const session = await getServerSession(authOptions);
  if(!session?.user.id)
    return unauthenticatedResponse();

  const parsed = z.number().int().safeParse(shopId) 
  if(!parsed.success)
    return clientFormattingErrorResponse(parsed.error.format())

  try {
    const result = await db.transaction(async tx => await queryItemsByShop(tx, parsed.data));
    return generalClientSuccess(result);
  } catch (e) {
    console.error(e);
    return internalServerErrorReponse();
  }
}


export async function getItemById(itemId: number) {
  const parsed = z.number().int().min(1).safeParse(itemId);

  if (!parsed.success)
    return notFoundResponse();

  const session = await getServerSession(authOptions);
  if(!session?.user.id) return unauthenticatedResponse();

  try {
    const result = await db.transaction(async tx => await queryItemById(tx, parsed.data));
    if (result && result.shop.ownerId !== session.user.id)
      return unauthorizedResponse();
    if(!result) return notFoundResponse();
    return generalClientSuccess(result);
  } catch (e) {
    console.log(e);
    return internalServerErrorReponse();
  }

}

export async function getAddonItems(shopId: number) {
  const parsed = z.number().int().min(1).safeParse(shopId);

  if(!parsed.success) return notFoundResponse();

  const session = await getServerSession(authOptions);
  if(!session?.user.id) return unauthenticatedResponse();

  try {
    const result = await db.transaction(async tx => await queryOptionItems(tx, shopId));
    if(!result) return notFoundResponse();
    return generalClientSuccess(result);

  } catch (e) {
    console.log(e);
    return internalServerErrorReponse();
  }

}



export async function createItemOptionCategory(optionCategoryData: ItemOptionCategoryInsert) {
  const parsed = itemOptionCategoryInsertSchema.safeParse(optionCategoryData);

  if (!parsed.success) return clientFormattingErrorResponse(parsed.error.format());

  return modifyShop(parsed.data.shopId, () => insertItemOptionCategory(parsed.data));

}


export async function getItemOptionCategoriesByShop(shopId: number) {
  const session = await getServerSession(authOptions);
  if(!session?.user.id)
    return unauthenticatedResponse();

  const parsed = z.number().int().safeParse(shopId) 
  if(!parsed.success)
    return clientFormattingErrorResponse(parsed.error.format())

  try {
    const result = await db.transaction(async tx => await queryItemOptionCategories(tx, parsed.data));
    return generalClientSuccess(result);
  } catch (e) {
    console.error(e);
    return internalServerErrorReponse();
  }
}

export async function createOptionCategoryOptions(optionCategoryId: number, itemIds: number[], shopId: number ) {
  const zodInt = z.number().int().min(1);
  const parsedOptionCategoryId = zodInt.safeParse(optionCategoryId);
  const parsedShopId = zodInt.safeParse(shopId);
  const parsedItemIds = zodInt.array().safeParse(itemIds);

  if(!parsedOptionCategoryId.success) return clientFormattingErrorResponse(parsedOptionCategoryId.error.format());
  if(!parsedShopId.success) return notFoundResponse();
  if(!parsedItemIds.success) return clientFormattingErrorResponse(parsedItemIds.error.format());

  return modifyShop(shopId, () => insertItemOptionCategoryOptions(parsedOptionCategoryId.data, parsedItemIds.data, parsedShopId.data));

}


export async function deleteOptionCategoryOptions(optionCategoryId: number, itemIds: number[], shopId: number ) {
  const zodInt = z.number().int().min(1);
  const parsedOptionCategoryId = zodInt.safeParse(optionCategoryId);
  const parsedShopId = zodInt.safeParse(shopId);
  const parsedItemIds = zodInt.array().safeParse(itemIds);

  if(!parsedOptionCategoryId.success) return clientFormattingErrorResponse(parsedOptionCategoryId.error.format());
  if(!parsedShopId.success) return notFoundResponse();
  if(!parsedItemIds.success) return clientFormattingErrorResponse(parsedItemIds.error.format());

  if(itemIds.length === 0) return null;

  return modifyShop(shopId, () => removeItemOptionCategoryOptions(parsedOptionCategoryId.data, parsedItemIds.data, parsedShopId.data));

}

export async function createItemOption(optionCategoryId: number, itemId: number, shopId: number ) {
  const zodInt = z.number().int().min(1);
  const parsedOptionCategoryId = zodInt.safeParse(optionCategoryId);
  const parsedShopId = zodInt.safeParse(shopId);
  const parsedItemId = zodInt.safeParse(itemId);

  if(!parsedOptionCategoryId.success) return clientFormattingErrorResponse(parsedOptionCategoryId.error.format());
  if(!parsedShopId.success || !parsedItemId.success) return notFoundResponse();

  return modifyShop(shopId, () => insertItemOption(parsedItemId.data, parsedOptionCategoryId.data, parsedShopId.data));

}


export async function deleteItemOption(optionCategoryId: number, itemId: number, shopId: number ) {
  const zodInt = z.number().int().min(1);
  const parsedOptionCategoryId = zodInt.safeParse(optionCategoryId);
  const parsedShopId = zodInt.safeParse(shopId);
  const parsedItemId = zodInt.safeParse(itemId);

  if(!parsedOptionCategoryId.success) return clientFormattingErrorResponse(parsedOptionCategoryId.error.format());
  if(!parsedShopId.success || !parsedItemId.success) return notFoundResponse();

  return modifyShop(shopId, () => removeItemOption(parsedItemId.data, parsedOptionCategoryId.data, parsedShopId.data));

}



// TODO Better error handling here since a failure probably means something depends on it
export async function deleteItemOptionCategory(optionCategoryId: number, shopId: number) {
  const parsedCatId = z.number().int().min(1).safeParse(optionCategoryId);
  const parsedShopId = z.number().int().min(1).safeParse(shopId);
  if(!parsedCatId.success || !parsedShopId.success) return notFoundResponse();
  
  return modifyShop(shopId, () => removeItemOptionCategory(optionCategoryId, shopId));

}
