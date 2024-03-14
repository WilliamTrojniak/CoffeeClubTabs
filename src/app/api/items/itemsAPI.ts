'use server'

import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { Item, ItemCategoriesInsert, ItemCategory, ItemInsert, ItemVariantCategoryInsert, itemCategoriesInsertSchema, itemInsertSchema, itemVariantCategoryInsertSchema } from "@/db/schema/items";
import { Response, clientFormattingErrorResponse, dataConflictResponse, generalClientSuccess, internalServerErrorReponse, notFoundResponse, unauthenticatedResponse, unauthorizedResponse } from "../responses";
import { createItemCategories, insertAndLinkItemCategories, insertItem, insertItemCategories, insertItemCategory, insertItemVariantCategory, linkItemCategories, queryItemById, queryItemCategoriesById, queryItemsByShop, removeItemCategoriesLink } from "@/db/api/items";
import { z } from "zod";
import { modifyShop } from "../shops/shopsAPI";
import { revalidatePath } from "next/cache";
import { Result } from "postcss";
import { queryShopById } from "@/db/api/shops";

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
    const categoryValidationData = await queryItemCategoriesById(existingCategories.map(i => i.id));

    if (existingCategories.length > 0 && existingCategories.length !== categoryValidationData?.filter(i => i.shopId === itemData.shopId).length) return dataConflictResponse();

    const newCategories = await insertItemCategories(categoryData.filter(category => !category.id).map(category => ({shopId: itemData.shopId, name: category.name})));
    const toLink = newCategories ? newCategories.concat(existingCategories) : existingCategories;
  
    await linkItemCategories(itemId, toLink.map(category => category.id));

    await removeItemCategoriesLink(itemId, removedCategories);

    revalidatePath(`/shops/${itemData.shopId}`);

    return generalClientSuccess(toLink);
  } catch (e) {
    console.log(e);
    return internalServerErrorReponse();
  }
}

