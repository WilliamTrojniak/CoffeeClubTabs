import { pgTable, primaryKey, real, serial, unique, varchar } from "drizzle-orm/pg-core";
import { shops } from "./shops";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const itemCategories = pgTable('item_categories', {
  id: serial('id').primaryKey(),
  shopId: serial('shop_id').references(() => shops.id).notNull(),
  name: varchar('name', {length: 127}), 
}, (table) => {
    return {
      unq: unique().on(table.shopId, table.name), // Name of categories must be unique within a shop
    }
});

export const items = pgTable('items', {
  id: serial('id').primaryKey(),
  shopId: serial('shop_id').references(() => shops.id).notNull(),
  name: varchar('name', {length: 127}).notNull(),
  basePrice: real('base_price').notNull(),
}, (table) => {
    return {
      unq: unique().on(table.shopId, table.name), // Items within a shop must be uniquely named
    }
});

// Many to many table
// Can have multiple items per category
// and multiple categories per item
export const itemToCategories = pgTable('items_to_categories', {
  id: serial('id').primaryKey(),
  itemId: serial('item_id').references(() => items.id).notNull(),
  itemCategoryId: serial('item_category_id').references(() => itemCategories.id).notNull(),
}, (table) => {
    return {
      unq: unique().on(table.itemId, table.itemCategoryId), // Can't add item to category multiple times
    }
});

export const itemVariantCategories = pgTable('item_variant_categories', {
  id: serial('id').primaryKey(),
  shopId: serial('shop_id').references(() => shops.id).notNull(),
  name: varchar('name', {length: 127}).notNull(),
}, (table) => {
    return {
      unq: unique().on(table.shopId, table.name),
    }
});

export const itemVariants = pgTable('item_variants', {
  id: serial('id').primaryKey(),
  itemId: serial('item_id').references(() => items.id),
  category: serial('category').references(() => itemVariantCategories.id), 
  name: varchar('name', {length: 127}),
  price: real('price').default(0).notNull(),
}, (table) => {
    return {
      unq: unique().on(table.itemId, table.category, table.name)
    }
});

export const itemOptions = pgTable('item_options', {
  parentItemId: serial('parent_item_id').references(() => items.id),
  optionItemId: serial('option_item_id').references(() => items.id),
  optionName: varchar('option_name', {length: 127}).notNull(),
}, (table) => {
    return {
      pk: primaryKey({columns: [table.parentItemId, table.optionItemId]}),
    }
});

export const itemAddons = pgTable('item_addons', {
  parentItemId: serial('parent_item_id').references(() => items.id),
  addonItemId: serial('addon_item_id').references(() => items.id),
}, (table) => {
    return {
      pk: primaryKey({columns: [table.parentItemId, table.addonItemId]})
    }
});


export const itemCategoriesInsertSchema = createInsertSchema(itemCategories);
export type ItemCategoriesInsert = z.infer<typeof itemCategoriesInsertSchema>;

export const itemCategorySchema = createSelectSchema(itemCategories);
export type ItemCategory = z.infer<typeof itemCategorySchema>;







