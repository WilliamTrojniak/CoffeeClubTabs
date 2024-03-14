'use server'

import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { Shop, ShopInsert, ShopPaymentOptionInsertData, shopInsertSchema, shopPaymentOptionInsertSchema } from "@/db/schema/shops";
import { insertPaymentOption, insertShop, queryShopById, queryShopCategoriesById, queryShopDetails, queryUserShops, removeShop } from "@/db/api/shops";
import { Response, clientFormattingErrorResponse, dataConflictResponse, generalClientSuccess, internalServerErrorReponse, notFoundResponse, unauthenticatedResponse, unauthorizedResponse } from "@/app/api/responses";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export async function createShop(data: ShopInsert): Promise<Response<Shop>> {
  
  const session = await getServerSession(authOptions);
  if (!session?.user.id)
    return unauthenticatedResponse();

  const parseResult = shopInsertSchema.safeParse(data);
  
  if (!parseResult.success) 
    return clientFormattingErrorResponse(parseResult.error.format());

  if (session.user.id != parseResult.data.ownerId)
    return unauthorizedResponse(); 
  
  try {
    const result = await insertShop(parseResult.data);
    if (!result)
      return dataConflictResponse(); 

    revalidatePath('/');
    return generalClientSuccess(result); 
  } catch (e) {
    console.log(e);
    return internalServerErrorReponse(); 
  }
}

export async function deleteShop(shopId: number): Promise<Response<Shop>> {
  const session = await getServerSession(authOptions);
  if (!session?.user.id)
    return unauthenticatedResponse();

  try {
    const target = await queryShopById(shopId);
    if (!target)
      return notFoundResponse();

    if(target.ownerId !== session.user.id)
      return unauthorizedResponse();

    const result = await removeShop(shopId);
    if (!result) return notFoundResponse();
    revalidatePath('/');
    return generalClientSuccess(result);
  } catch {
    return internalServerErrorReponse();
  }
}

export async function getUserShops(userId: string) {
  try {
    const result = await queryUserShops(userId);
    return generalClientSuccess(result); 
  } catch {
    return internalServerErrorReponse(); 
  }
}

export async function getShopById(shopId: number) {
  try {
    const result = await queryShopById(shopId);
    if (!result) return notFoundResponse();
    return generalClientSuccess(result);
  } catch {
    return internalServerErrorReponse();
  }
}

export async function getShopDetails(shopId: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user.id)
    return unauthenticatedResponse();

  const parsed = z.number().int().safeParse(shopId);
  if (!parsed.success) return clientFormattingErrorResponse(parsed.error.format()); 
  

  try {
    const shopData = await queryShopDetails(parsed.data);
    if (!shopData) return notFoundResponse();
    if (shopData.ownerId !== session.user.id) return unauthorizedResponse();
    return generalClientSuccess(shopData);
  } catch (error) {
    console.log(error);
    return internalServerErrorReponse();
  }
}

export async function modifyShop<T>(shopId: number, modifyFunc: () => Promise<T | null>): Promise<Response<T>> {
  const session = await getServerSession(authOptions);
  if(!session?.user.id)
    return unauthenticatedResponse();

  try {
    const shopData = await queryShopById(shopId);
    if(!shopData) return notFoundResponse();
    if(shopData.ownerId !== session.user.id) return unauthorizedResponse();

    const result = await modifyFunc();
    if(!result) return dataConflictResponse();
    revalidatePath(`/shops/${shopId}`)
    return generalClientSuccess(result)
  } catch (e) {
    console.error(e);
    return internalServerErrorReponse();
  }
}

export async function createPaymentOption(data: ShopPaymentOptionInsertData) {
  const parsed = shopPaymentOptionInsertSchema.safeParse(data);
  if (!parsed.success)
    return clientFormattingErrorResponse(parsed.error.format());
  
  return modifyShop(parsed.data.shopId, () => insertPaymentOption(parsed.data));
}

export async function getShopItemCategoriesById(shopId: number) {
  const parsed = z.number().int().min(0).safeParse(shopId);
  if(!parsed.success)
    return clientFormattingErrorResponse(parsed.error.format());

  try {
    const shopCategories = await queryShopCategoriesById(shopId);
    if(!shopCategories) return notFoundResponse();
    return generalClientSuccess(shopCategories);
  } catch (e) {
    console.log(e);
    return internalServerErrorReponse();
  }

}
