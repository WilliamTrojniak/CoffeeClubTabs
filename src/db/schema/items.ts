import { integer, pgTable, primaryKey, real, serial, unique, varchar } from "drizzle-orm/pg-core";
import { shops } from "./shops";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const itemCategories = pgTable('item_categories', {
  id: serial('id').primaryKey(),
  shopId: integer('shop_id').references(() => shops.id).notNull(),
  name: varchar('name', {length: 127}).notNull(), 
}, (table) => {
    return {
      unq: unique().on(table.shopId, table.name), // Name of categories must be unique within a shop
    }
});

export const itemCategoriesRelations = relations(itemCategories, ({one, many}) => {
  return {
    shops: one(shops, {
      fields: [itemCategories.shopId],
      references: [shops.id]
    }),
    items: many(itemToCategories),
  };
});

export const items = pgTable('items', {
  id: serial('id').primaryKey(),
  shopId: integer('shop_id').references(() => shops.id).notNull(),
  name: varchar('name', {length: 127}).notNull(),
  basePrice: real('base_price').notNull(),
}, (table) => {
    return {
      unq: unique().on(table.shopId, table.name), // Items within a shop must be uniquely named
    }
});

export const itemsRelations = relations(items, ({one, many}) => {
  return {
    shop: one(shops, {
      fields: [items.shopId],
      references: [shops.id]
    }),
    categories: many(itemToCategories),
    variants: many(itemVariantCategories),
    options: many(itemOptions, {relationName: "parentItem"}),
    addons: many(itemAddons, {relationName: "parentItem"}),
    // TODO The backwards options and addons relationships are missing
    // i.e. is this item an option and or addon for any other item(s)
  }
});

// Many to many table
// Can have multiple items per category
// and multiple categories per item
export const itemToCategories = pgTable('items_to_categories', {
  id: serial('id').primaryKey(),
  itemId: integer('item_id').references(() => items.id).notNull(),
  itemCategoryId: integer('item_category_id').references(() => itemCategories.id).notNull(),
}, (table) => {
    return {
      unq: unique().on(table.itemId, table.itemCategoryId), // Can't add item to category multiple times
    }
});

export const itemToCategoriesRelations = relations(itemToCategories, ({one}) => {
  return {
    item: one(items, {
      fields: [itemToCategories.itemId],
      references: [items.id]
    }),
    category: one(itemCategories, {
      fields: [itemToCategories.itemCategoryId],
      references: [itemCategories.id],
    }),
  }
});

export const itemVariantCategories = pgTable('item_variant_categories', {
  id: serial('id').primaryKey(),
  parentItemId: integer('parent_item_id').references(() => items.id).notNull(),
  name: varchar('name', {length: 127}).notNull(),
  index: serial('index').notNull().unique(),
}, (table) => {
    return {
      unq: unique().on(table.parentItemId, table.name),
    }
});

export const itemVariantCategoriesRelations = relations(itemVariantCategories, ({one, many}) => {
  return {
    parentItem: one(items, {
      fields: [itemVariantCategories.parentItemId],
      references: [items.id],
    }),
    variantOptions: many(itemVariants)
  }
});

export const itemVariants = pgTable('item_variants', {
  id: serial('id').primaryKey(),
  categoryId: integer('category').references(() => itemVariantCategories.id).notNull(), 
  name: varchar('name', {length: 127}).notNull(),
  price: real('price').default(0).notNull(),
  index: serial('index').notNull().unique(),
}, (table) => {
    return {
      unq: unique().on(table.categoryId, table.name),
    }
});

export const itemVariantsRelations = relations(itemVariants, ({one}) => {
  return {
    category: one(itemVariantCategories, {
      fields: [itemVariants.categoryId],
      references: [itemVariantCategories.id]
    })
  }
});

export const itemOptions = pgTable('item_options', {
  parentItemId: integer('parent_item_id').references(() => items.id),
  optionItemId: integer('option_item_id').references(() => items.id),
  optionName: varchar('option_name', {length: 127}).notNull(),
}, (table) => {
    return {
      pk: primaryKey({columns: [table.parentItemId, table.optionItemId]}),
    }
});

export const itemOptionsRelations = relations(itemOptions, ({one}) => {
  return {
    parentItem: one(items, {
      fields: [itemOptions.parentItemId],
      references: [items.id],
      relationName: "parentItem"
    }),
    optionItem: one(items, {
      fields: [itemOptions.optionItemId],
      references: [items.id],
    }),
  }
});

export const itemAddons = pgTable('item_addons', {
  parentItemId: integer('parent_item_id').references(() => items.id),
  addonItemId: integer('addon_item_id').references(() => items.id),
}, (table) => {
    return {
      pk: primaryKey({columns: [table.parentItemId, table.addonItemId]})
    }
});

export const itemAddonsRelations = relations(itemAddons, ({one}) => {
  return {
    parentItem: one(items, {
      fields: [itemAddons.parentItemId],
      references: [items.id],
      relationName: "parentItem"
    }),
    addonItem: one(items, {
      fields: [itemAddons.addonItemId],
      references: [items.id],
    }),
  }
});


export const itemCategoriesInsertSchema = createInsertSchema(itemCategories, {
    name: z.string().nonempty().max(127),
});
export type ItemCategoriesInsert = z.infer<typeof itemCategoriesInsertSchema>;

export const itemCategorySchema = createSelectSchema(itemCategories);
export type ItemCategory = z.infer<typeof itemCategorySchema>;


export const itemInsertSchema = createInsertSchema(items, {
  name: z.string().nonempty("Must not be empty").max(127),
  basePrice: z.number().nonnegative()
});
export type ItemInsert = z.infer<typeof itemInsertSchema>;

export const itemSchema = createSelectSchema(items);
export type Item = z.infer<typeof itemSchema>;


export const itemVariantCategoryInsertSchema = createInsertSchema(itemVariantCategories, {
  name: z.string().nonempty("Must not be empty").max(127),
});
export type ItemVariantCategoryInsert = z.infer<typeof itemVariantCategoryInsertSchema>;

export const itemVariantCategorySchema = createSelectSchema(itemVariantCategories);
export type ItemVariantCategory = z.infer<typeof itemVariantCategorySchema>;


export const itemVariantInsertSchema = createInsertSchema(itemVariants, {
  name: z.string().nonempty("Must not be empty").max(127),
  price: z.number().nonnegative()
});
export type ItemVariantInsert = z.infer<typeof itemVariantInsertSchema>;

export const itemVariantSchema = createSelectSchema(itemVariants);
export type itemVariant = z.infer<typeof itemVariantSchema>;


