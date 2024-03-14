'use server'

import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { Item, ItemCategoriesInsert, ItemInsert, ItemOptionCategoryInsert, ItemVariantCategoryInsert, itemCategoriesInsertSchema, itemInsertSchema, itemOptionCategoryInsertSchema, itemVariantCategoryInsertSchema } from "@/db/schema/items";
import { Response, clientFormattingErrorResponse, dataConflictResponse, generalClientSuccess, internalServerErrorReponse, notFoundResponse, unauthenticatedResponse, unauthorizedResponse } from "../responses";
import { insertItem, insertItemCategories, insertItemCategory, insertItemOptionCategory, insertItemOptionCategoryOptions, insertItemVariantCategory, linkItemCategories, queryItemById, queryItemCategoriesById, queryItemOptionCategories, queryItemsByShop, queryOptionItems, removeItemCategoriesLink, removeItemOptionCategoryOptions } from "@/db/api/items";
import { z } from "zod";
import { modifyShop } from "../shops/shopsAPI";
import { revalidatePath } from "next/cache";
import { ConsoleLogWriter } from "drizzle-orm";
import { parse } from "path";

export async function createItem(data: ItemInsert): Promise<Response<Item>> {

  const parsed = itemInsertSchema.safeParse(data);

  if(!parsed.success)
    return clientFormattingErrorResponse(parsed.error.format());
  
  return modifyShop(parsed.data.shopId, () => insertItem(parsed.data));
}


export async function getItemsByShop(shopId: number): Promise<Response<Item[]>> {
  const session = await getServerSession(authOptions);
  if(!session?.user.id)
    return unauthenticatedResponse();

  const parsed = z.number().int().safeParse(shopId) 
  if(!parsed.success)
    return clientFormattingErrorResponse(parsed.error.format())

  try {
    const result = await queryItemsByShop(parsed.data);
    return generalClientSuccess(result);
  } catch (e) {
    console.error(e);
    return internalServerErrorReponse();
  }
}


export async function createItemCategory(data: ItemCategoriesInsert) {
  
  const parsed = itemCategoriesInsertSchema.safeParse(data);
  
  if (!parsed.success) 
    return clientFormattingErrorResponse(parsed.error.format());

  return modifyShop(parsed.data.shopId, () => insertItemCategory(parsed.data));

}


export async function createItemVariantCategory(data: ItemVariantCategoryInsert) {

  const parsed = itemVariantCategoryInsertSchema.safeParse(data);

  if (!parsed.success)
    return clientFormattingErrorResponse(parsed.error.format());

  // TODO Ammend
  return modifyShop(parsed.data.shopId, () => insertItemVariantCategory(parsed.data));

}

export async function getItemById(itemId: number) {
  const parsed = z.number().int().min(1).safeParse(itemId);

  if (!parsed.success)
    return notFoundResponse();

  const session = await getServerSession(authOptions);
  if(!session?.user.id) return unauthenticatedResponse();

  try {
    const result = await queryItemById(parsed.data);
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
    const result = await queryOptionItems(shopId);
    if(!result) return notFoundResponse();
    return generalClientSuccess(result);

  } catch (e) {
    console.log(e);
    return internalServerErrorReponse();
  }

}


export async function createLinkAndPurgeItemCategories(itemId: number, categoryData: ItemCategoriesInsert[], removedCategories: number[] ) {
  const parsedItem = z.number().int().min(1).safeParse(itemId);
  const parsedCategoryData = itemCategoriesInsertSchema.array().safeParse(categoryData);
  const parsedRemoveData = z.number().int().min(1).array().safeParse(removedCategories);

  if(!parsedItem.success) return clientFormattingErrorResponse(parsedItem.error.format());

  if(!parsedCategoryData.success) return clientFormattingErrorResponse(parsedCategoryData.error.format());

  if(!parsedRemoveData.success) return clientFormattingErrorResponse(parsedRemoveData.error.format());

  const session = await getServerSession(authOptions);
  if(!session?.user.id) return unauthenticatedResponse();

  try {
    const itemData = await queryItemById(parsedItem.data);
    if(!itemData) return dataConflictResponse();
    if(itemData.shop.ownerId !== session.user.id) return unauthorizedResponse();

    const existingCategories = parsedCategoryData.data.filter(i => i.id) as {shopId: number, id: number, name: string}[];

    const newCategories = await insertItemCategories(categoryData.filter(category => !category.id).map(category => ({shopId: itemData.shop.id, name: category.name})));
    const toLink = newCategories ? newCategories.concat(existingCategories) : existingCategories;
  
    // TODO Provide better feedback if an error occurs here? Will throw an error
    // if the item and any of the categories do not belong to the same shop
    await linkItemCategories(itemId, toLink.map(category => category.id), itemData.shop.id);

    // Only removes links under the same shopId
    await removeItemCategoriesLink(itemId, removedCategories, itemData.shop.id);

    revalidatePath(`/shops/${itemData.shop.id}`);

    return generalClientSuccess(toLink);
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
    const result = await queryItemOptionCategories(parsed.data);
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

  const session = await getServerSession(authOptions);
  if(!session?.user.id) return unauthenticatedResponse();

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

  const session = await getServerSession(authOptions);
  if(!session?.user.id) return unauthenticatedResponse();

  if(itemIds.length === 0) return null;

  return modifyShop(shopId, () => removeItemOptionCategoryOptions(parsedOptionCategoryId.data, parsedItemIds.data, parsedShopId.data));

}

