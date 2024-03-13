'use server'

import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { Item, ItemCategoriesInsert, ItemCategory, ItemInsert, ItemVariantCategoryInsert, itemCategoriesInsertSchema, itemInsertSchema, itemVariantCategoryInsertSchema } from "@/db/schema/items";
import { Response, clientFormattingErrorResponse, generalClientSuccess, internalServerErrorReponse, notFoundResponse, unauthenticatedResponse, unauthorizedResponse } from "../responses";
import { insertAndLinkItemCategories, insertItem, insertItemCategory, insertItemVariantCategory, queryItemById, queryItemsByShop } from "@/db/api/items";
import { z } from "zod";
import { modifyShop } from "../shops/shopsAPI";
import { revalidatePath } from "next/cache";

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

export async function createAndAddItemCategories(shopId: number, itemId: number, data: ItemCategoriesInsert[] ) {
  await insertAndLinkItemCategories(itemId, data);
  revalidatePath(`/shops/${shopId}`);
}
