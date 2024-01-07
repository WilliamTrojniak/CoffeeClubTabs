'use server'

import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { Shop, ShopInsert } from "@/db/schema/shops";
import { insertShop, queryUserShops } from "@/db/api/shops";
import { Response } from "@/app/api/responses";

export async function createShop(data: ShopInsert): Promise<Response<Shop>> {
  const session = await getServerSession(authOptions);
  if (!session?.user.id) return {status: 401, data: {message: "Unauthenticated Request"}};
  if (session.user.id != data.ownerId) return {status: 403, data: {message: "Unauthorized Request"}};
  
  try {
    const result = await insertShop(data);
    if (!result) throw Error("Failed to insert shop");
    return {status: 201, data: result}
  } catch {
    return {status: 500, data: { message: "Internal Server Error" }}
  }
}

export async function getUserShops(userId: string): Promise<Response<Shop[]>> {
  try {
    const result = await queryUserShops(userId);
    return { status: 200, data: result };
  } catch {
    return {status: 500, data: { message: "Internal Server Error" }}
  }
}
