'use server'

import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { revalidatePath } from "next/cache";
import { Item, ItemCategoriesInsert, ItemCategory, ItemInsert, itemCategoriesInsertSchema, itemInsertSchema } from "@/db/schema/items";
import { Response, clientFormattingErrorResponse, dataConflictResponse, generalClientSuccess, internalServerErrorReponse, notFoundResponse, unauthenticatedResponse, unauthorizedResponse } from "../responses";
import { queryShopById } from "@/db/api/shops";
import { insertItem, insertItemCategory, queryItemsByShop } from "@/db/api/items";
import { z } from "zod";

export async function createItemCategory(data: ItemCategoriesInsert): Promise<Response<ItemCategory>> {
  
  const session = await getServerSession(authOptions);
  if (!session?.user.id)
    return unauthenticatedResponse();

  const parsed = itemCategoriesInsertSchema.safeParse(data);
  
  if (!parsed.success) 
    return clientFormattingErrorResponse(parsed.error.format());

  try {
    const shopData = await queryShopById(parsed.data.shopId);
    if(!shopData) return notFoundResponse();
    if(shopData.ownerId !== session.user.id) return unauthorizedResponse();
    
    const result = await insertItemCategory(parsed.data)
    if(!result) return dataConflictResponse();
    revalidatePath(`/shops/${parsed.data.shopId}`)
    return generalClientSuccess(201, result);
  } catch (e) {
    console.error(e);
    return internalServerErrorReponse();
  }
}

export async function createItem(data: ItemInsert): Promise<Response<Item>> {
  const session = await getServerSession(authOptions);
  if(!session?.user.id)
    return unauthenticatedResponse();
  
  const parsed = itemInsertSchema.safeParse(data);

  if(!parsed.success)
    return clientFormattingErrorResponse(parsed.error.format());

  try {
    const shopData = await queryShopById(parsed.data.shopId);
    if(!shopData) return notFoundResponse();
    if(shopData.ownerId !== session.user.id) return unauthorizedResponse();

    const result = await insertItem(parsed.data);
    if(!result) return dataConflictResponse();
    revalidatePath(`/shops/${parsed.data.shopId}`)
    return generalClientSuccess(201, result)
  } catch (e) {
    console.error(e);
    return internalServerErrorReponse();
  }
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
    return generalClientSuccess(200, result);
  } catch (e) {
    console.error(e);
    return internalServerErrorReponse();
  }
}
