import { ItemOptionCategoryInsert, ItemVariantCategoryInsert, ItemVariantInsert, itemCategoriesInsertSchema, itemInsertSchema, itemOptionCategoryInsertSchema, itemSchema, itemVariantCategoryInsertSchema, itemVariantInsertSchema } from "@/db/schema/items";
import { z } from "zod";

export const ItemUpdateSchema = z.object({
  shopId: z.number().int().min(1),
  item: itemInsertSchema,
  itemCategories: itemCategoriesInsertSchema.array(),
  itemVariants: itemVariantCategoryInsertSchema.merge(z.object({variantOptions: itemVariantInsertSchema.array()})).array(),
  itemOptions: itemOptionCategoryInsertSchema.merge(z.object({options: itemSchema.array(), enabled: z.boolean()})).array(),
  itemAddons: itemSchema.array(),
});
