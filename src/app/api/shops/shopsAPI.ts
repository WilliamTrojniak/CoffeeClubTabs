'use server'

import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { Shop, ShopInsert, ShopPaymentOptionInsertData, shopInsertSchema, shopPaymentOptionInsertSchema } from "@/db/schema/shops";
import { insertPaymentOption, insertShop, queryShopById, queryUserShops, removeShop } from "@/db/api/shops";
import { Response, clientFormattingErrorResponse, dataConflictResponse, generalClientSuccess, internalServerErrorReponse, notFoundResponse, unauthenticatedResponse, unauthorizedResponse } from "@/app/api/responses";
import { revalidatePath } from "next/cache";

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
    return generalClientSuccess(201, result); 
  } catch {
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
    return generalClientSuccess(200, result);
  } catch {
    return internalServerErrorReponse();
  }
}

export async function getUserShops(userId: string) {
  try {
    const result = await queryUserShops(userId);
    return generalClientSuccess(200, result); 
  } catch {
    return internalServerErrorReponse(); 
  }
}

export async function getShopById(shopId: number) {
  try {
    const result = await queryShopById(shopId);
    if (!result) return notFoundResponse();
    return generalClientSuccess(200, result);
  } catch {
    return internalServerErrorReponse();
  }
}

export async function createPaymentOption(data: ShopPaymentOptionInsertData) {
  const session = await getServerSession(authOptions);
  if(!session?.user.id)
    return unauthenticatedResponse();

  const parsed = shopPaymentOptionInsertSchema.safeParse(data);
  if (!parsed.success)
    return clientFormattingErrorResponse(parsed.error.format());

  try {
    const shopData = await queryShopById(parsed.data.shopId);
    if (!shopData)
      return notFoundResponse();
    
    if (shopData.ownerId !== session.user.id)
      return unauthorizedResponse();
    
    const result = await insertPaymentOption(parsed.data);
    if (!result) return dataConflictResponse();
    revalidatePath(`/shops/${parsed.data.shopId}`);
    return result;
  } catch {
    return internalServerErrorReponse();
  }
}
