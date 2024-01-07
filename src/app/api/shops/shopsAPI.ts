'use server'

import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { Shop, ShopInsert, shopInsertSchema } from "@/db/schema/shops";
import { insertShop, queryShopId, queryUserShops, removeShop } from "@/db/api/shops";
import { Response, dataConflictResponse, generalClientErrorResponse, generalClientSuccess, internalServerErrorReponse, notFoundResponse, unauthenticatedResponse, unauthorizedResponse } from "@/app/api/responses";
import { revalidatePath } from "next/cache";

export async function createShop(data: ShopInsert): Promise<Response<Shop>> {
  
  const session = await getServerSession(authOptions);
  if (!session?.user.id)
    return unauthenticatedResponse();

  const parseResult = shopInsertSchema.safeParse(data);
  
  if (!parseResult.success) 
    return generalClientErrorResponse(parseResult.error.format());

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
    const target = await queryShopId(shopId);
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

export async function getUserShops(userId: string): Promise<Response<Shop[]>> {
  try {
    const result = await queryUserShops(userId);
    return generalClientSuccess(200, result); 
  } catch {
    return internalServerErrorReponse(); 
  }
}
