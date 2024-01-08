'use server'

import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { revalidatePath } from "next/cache";
import { ItemCategoriesInsert, ItemCategory, itemCategoriesInsertSchema } from "@/db/schema/items";
import { Response, clientFormattingErrorResponse, dataConflictResponse, generalClientSuccess, internalServerErrorReponse, notFoundResponse, unauthenticatedResponse, unauthorizedResponse } from "../responses";
import { queryShopById } from "@/db/api/shops";
import { insertItemCategory } from "@/db/api/items";

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
  } catch {
    return internalServerErrorReponse();
  }
}
