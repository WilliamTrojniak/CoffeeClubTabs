'use server'

import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { Item, ItemOptionCategoryInsert, ItemVariantCategoryInsert, ItemVariantInsert, itemCategoriesInsertSchema, itemInsertSchema, itemOptionCategoryInsertSchema, itemOptions, itemSchema, itemVariantCategoryInsertSchema, itemVariantInsertSchema, itemVariants } from "@/db/schema/items";
import { Response, clientFormattingErrorResponse, generalClientSuccess, internalServerErrorReponse, notFoundResponse, unauthenticatedResponse, unauthorizedResponse } from "../responses";
import { insertItem, queryItemById, queryItemsByShop, queryOptionItems } from "@/db/api/items";
import { z } from "zod";
import { modifyShop } from "../shops/shopsAPI";
import { db } from "@/db/api/database";
import { insertAndSetItemCategories } from "@/db/api/itemCategories";
import { updateItemVariantCategories, updateItemVariantsOptions } from "@/db/api/itemVariants";
import { queryItemOptionCategories, updateItemOptionCategories, updateItemOptions, updateItemOptionsOptions } from "@/db/api/itemOptions";
import { updateItemAddons } from "@/db/api/itemAddons";
import { ItemUpdateSchema } from "./schema";


export type ItemUpdateData = z.input<typeof ItemUpdateSchema>;

export async function updateItem(data: ItemUpdateData) {

  const ItemUpdateSchemaTransforms = ItemUpdateSchema.extend({
    itemVariants: ItemUpdateSchema.shape.itemVariants.transform(
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
      }),
   itemOptions: ItemUpdateSchema.shape.itemOptions.transform(
    itemOptionsArr => itemOptionsArr.reduce<{categories: ItemOptionCategoryInsert[], options: number[][], enabled: boolean[]}>((accumulator, itemOption) => {
      accumulator.categories.push({
        id: itemOption.id,
        name: itemOption.name
      });
      accumulator.options.push(itemOption.options.map(optionItem => optionItem.id));
        accumulator.enabled.push(itemOption.enabled);
        return accumulator;
      }, {categories: [], options: [], enabled: []})
    ), 
  });

  const parsed = ItemUpdateSchemaTransforms.safeParse(data);

  if(!parsed.success)
    return clientFormattingErrorResponse(parsed.error.format());

  const result = await db.transaction(async tx => {
    return await modifyShop(tx, parsed.data.shopId, async (tx, shopId) => {
      // TODO Fix authorization
      const itemData = await insertItem(tx, parsed.data.shopId, parsed.data.item);
      if (!itemData) {
        tx.rollback();
        return;
      }
      
      const itemCategoriesData = await insertAndSetItemCategories(tx, parsed.data.shopId, itemData.id, parsed.data.itemCategories.map(data => ({...data, shopId})));

      // Set item variant categories and add their options
      await tx.transaction(async tx => {
        const itemVariantCategoriesData = await updateItemVariantCategories(tx, shopId, itemData.id, parsed.data.itemVariants.categories);
        if (itemVariantCategoriesData.length !== parsed.data.itemVariants.categories.length) {
          tx.rollback();
          return
        }
        const itemVariantsData = await updateItemVariantsOptions(tx, shopId, itemData.id, itemVariantCategoriesData.map(cat => cat.id), parsed.data.itemVariants.options);
      });


      // Create item options and add them to the item
      await tx.transaction(async tx => {
        const itemOptionCategoriesData = await updateItemOptionCategories(tx, shopId, parsed.data.itemOptions.categories);
        if (itemOptionCategoriesData.length !== parsed.data.itemOptions.categories.length) {
          tx.rollback();
          return;
        }
        const itemOptionsOptionsData = await updateItemOptionsOptions(tx, shopId, itemOptionCategoriesData.map(entry => entry.id), parsed.data.itemOptions.options)

        const itemOptionsData = await updateItemOptions(tx, shopId, itemData.id, itemOptionCategoriesData.filter((_, index) => parsed.data.itemOptions.enabled[index]).map(entry => entry.id));
      });

      await updateItemAddons(tx, shopId, itemData.id, parsed.data.itemAddons.map(item => item.id));

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

