import { integer, pgTable, primaryKey, real, serial, unique, varchar, foreignKey } from "drizzle-orm/pg-core";
import { shops } from "./shops";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const itemCategories = pgTable('item_categories', {
  shopId: integer('shop_id').references(() => shops.id).notNull(),
  id: serial('id').notNull(),
  name: varchar('name', {length: 127}).notNull(), 
  index: integer('index').notNull().default(0),
}, (table) => {
    return {
      pk: primaryKey({columns: [table.id, table.shopId]}),
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
  shopId: integer('shop_id').references(() => shops.id).notNull(),
  id: serial('id').notNull(),
  name: varchar('name', {length: 127}).notNull(),
  basePrice: real('base_price').notNull(),
}, (table) => {
    return {
      pk: primaryKey({columns: [table.shopId, table.id]}),
      unq_name: unique().on(table.shopId, table.name), // Items within a shop must be uniquely named
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
    childOption: many(itemOptionCategoryOptions, {relationName: "itemOptionChildItems"}),
  }
});

// Many to many table
// Can have multiple items per category
// and multiple categories per item
export const itemToCategories = pgTable('items_to_categories', {
  shopId: integer('shop_id').notNull(),
  itemId: integer('item_id').notNull(),
  categoryId: integer('category_id').notNull(),
  index: integer('index').notNull().default(0),
}, (table) => {
    return {
      pk: primaryKey({columns: [table.shopId, table.itemId, table.categoryId]}),
      item_fk: foreignKey({
        columns: [table.shopId, table.itemId],
        foreignColumns: [items.shopId, items.id],
        name: "item_fk"
      }),
      itemCategory_fk: foreignKey({
        columns: [table.shopId, table.categoryId],
        foreignColumns: [itemCategories.shopId, itemCategories.id],
        name: "item_category_fk"
      }),
    }
});

export const itemToCategoriesRelations = relations(itemToCategories, ({one}) => {
  return {
    item: one(items, {
      fields: [itemToCategories.shopId, itemToCategories.itemId],
      references: [items.shopId, items.id]
    }),
    category: one(itemCategories, {
      fields: [itemToCategories.shopId, itemToCategories.categoryId],
      references: [itemCategories.shopId, itemCategories.id],
    }),
  }
});

export const itemVariantCategories = pgTable('item_variant_categories', {
  shopId: integer('shop_id').notNull(),
  itemId: integer('item_id').notNull(),
  id: serial('id').notNull(),
  name: varchar('name', {length: 127}).notNull(),
  index: serial('index').notNull().unique(),
}, (table) => {
    return {
      pk: primaryKey({columns: [table.shopId, table.itemId, table.id]}),
      fk: foreignKey({
        columns: [table.shopId, table.itemId],
        foreignColumns: [items.shopId, items.id],
      }),
      unq: unique().on(table.shopId, table.itemId, table.name),
    }
});

export const itemVariantCategoriesRelations = relations(itemVariantCategories, ({one, many}) => {
  return {
    item: one(items, {
      fields: [itemVariantCategories.shopId, itemVariantCategories.itemId],
      references: [items.shopId, items.id],
    }),
    variantOptions: many(itemVariants)
  }
});

export const itemVariants = pgTable('item_variants', {
  shopId: integer('shop_id').notNull(),
  itemId: integer('item_id').notNull(),
  categoryId: integer('category_id').notNull(),
  id: serial('id').notNull(),
  name: varchar('name', {length: 127}).notNull(),
  price: real('price').default(0).notNull(),
  index: integer('index').notNull().default(0),
}, (table) => {
    return {
      pk: primaryKey({columns: [table.shopId, table.itemId, table.categoryId, table.id]}),
      fk: foreignKey({
        columns: [table.shopId, table.itemId, table.categoryId],
        foreignColumns: [itemVariantCategories.shopId, itemVariantCategories.itemId, itemVariantCategories.id],
      }),
      unq: unique().on(table.shopId, table.itemId, table.categoryId, table.name),
    }
});

export const itemVariantsRelations = relations(itemVariants, ({one}) => {
  return {
    category: one(itemVariantCategories, {
      fields: [itemVariants.shopId, itemVariants.itemId, itemVariants.categoryId],
      references: [itemVariantCategories.shopId, itemVariantCategories.itemId, itemVariantCategories.id],
    })
  }
});

export const itemOptionCategories = pgTable('item_option_categories', {
  shopId: integer('shop_id').references(() => shops.id).notNull(),
  id: serial('id').notNull(),
  name: varchar('name', {length: 127}).notNull(),
  index: integer('index').notNull().default(0),
}, (table) => {
    return {
      pk: primaryKey({columns: [table.shopId, table.id]}),
      unq_name: unique().on(table.shopId, table.name),
    }
});

export const itemOptionCategoriesRelations = relations(itemOptionCategories, ({many}) => {
  return {
    options: many(itemOptionCategoryOptions),
    parentItems: many(itemOptions),
  }

})

export const itemOptionCategoryOptions = pgTable('item_option_category_options', {
  shopId: integer('shop_id').notNull(),
  categoryId: integer('option_id').notNull(),
  itemId: integer('item_id').notNull(),
  id: serial('id').unique().notNull(),
  index: integer('index').notNull().default(0),
}, (table) => {
    return {
      pk: primaryKey({columns: [table.shopId, table.categoryId, table.itemId]}),
      category_fk: foreignKey({
        columns: [table.shopId, table.categoryId],
        foreignColumns: [itemOptionCategories.shopId, itemOptionCategories.id]
      }),
      item_fk: foreignKey({
        columns: [table.shopId, table.itemId],
        foreignColumns: [items.shopId, items.id],
      })
    }
})

export const itemOptionCategoryOptionsRelations = relations(itemOptionCategoryOptions, ({one}) => {
  return {
    optionItem: one(items, {
      fields: [itemOptionCategoryOptions.shopId, itemOptionCategoryOptions.itemId],
      references: [items.shopId, items.id],
      relationName: "itemOptionChildItems"
    }),
    optionCategory: one(itemOptionCategories, {
      fields: [itemOptionCategoryOptions.shopId, itemOptionCategoryOptions.itemId],
      references: [itemOptionCategories.shopId, itemOptionCategories.id]
    })
  }
});

export const itemOptions = pgTable('item_options', {
  shopId: integer('shop_id').notNull(),
  itemId: integer('item_id').notNull(),
  optionId: integer('option_id').notNull(),
  id: serial('id').unique().notNull(),
  index: integer('index').notNull().default(0),
}, (table) => {
    return {
      pk: primaryKey({columns: [table.shopId, table.itemId, table.optionId]}),
      item_fk: foreignKey({
        columns: [table.shopId, table.itemId],
        foreignColumns: [items.shopId, items.id]
      }),
      category_fk: foreignKey({
        columns: [table.shopId, table.optionId],
        foreignColumns: [itemOptionCategories.shopId, itemOptionCategories.id]
      })
    }
});

export const itemOptionsRelations = relations(itemOptions, ({one}) => {
  return {
    parentItem: one(items, {
      fields: [itemOptions.shopId, itemOptions.itemId],
      references: [items.shopId, items.id],
      relationName: "parentItem"
    }),
    optionCategory: one(itemOptionCategories, {
      fields: [itemOptions.shopId, itemOptions.optionId],
      references: [itemOptionCategories.shopId, itemOptionCategories.id],
      relationName: "optionCategory"
    }),
  }
});

export const itemAddons = pgTable('item_addons', {
  shopId: integer('shop_id').notNull(),
  itemId: integer('item_id').notNull(),
  addonId: integer('addon_id').notNull(),
  id: serial('id').notNull().unique(),
  index: integer('index').notNull().default(0),
}, (table) => {
    return {
      pk: primaryKey({columns: [table.shopId, table.itemId, table.addonId]}),
      item_fk: foreignKey({
        columns: [table.shopId, table.itemId],
        foreignColumns: [items.shopId, items.id],
      }),
      addon_fk: foreignKey({
        columns: [table.shopId, table.addonId],
        foreignColumns: [items.shopId, items.id],
      }),
    }
});

export const itemAddonsRelations = relations(itemAddons, ({one}) => {
  return {
    parentItem: one(items, {
      fields: [itemAddons.shopId, itemAddons.itemId],
      references: [items.shopId, items.id],
      relationName: "parentItem"
    }),
    addonItem: one(items, {
      fields: [itemAddons.shopId, itemAddons.addonId],
      references: [items.shopId, items.id],
    }),
  }
});


export const itemCategoriesInsertSchema = createInsertSchema(itemCategories, {
    name: z.string().trim().min(1).max(127),
}).omit({shopId: true});
export type ItemCategoriesInsert = z.infer<typeof itemCategoriesInsertSchema>;

export const itemCategorySchema = createSelectSchema(itemCategories);
export type ItemCategory = z.infer<typeof itemCategorySchema>;

export const itemToCategoriesInsertSchema = createInsertSchema(itemToCategories).omit({shopId: true, itemId: true});
export type ItemToCategories = z.infer<typeof itemToCategoriesInsertSchema>;


export const itemInsertSchema = createInsertSchema(items, {
  name: z.string().trim().min(1).max(127),
  basePrice: z.number().nonnegative().transform(val => parseFloat(val.toFixed(2))),
}).omit({shopId: true});
export type ItemInsert = z.infer<typeof itemInsertSchema>;

export const itemSchema = createSelectSchema(items);
export type Item = z.infer<typeof itemSchema>;


export const itemVariantCategoryInsertSchema = createInsertSchema(itemVariantCategories, {
  name: z.string().trim().min(1).max(127),
}).omit({shopId: true, itemId: true});
export type ItemVariantCategoryInsert = z.infer<typeof itemVariantCategoryInsertSchema>;

export const itemVariantCategorySchema = createSelectSchema(itemVariantCategories);
export type ItemVariantCategory = z.infer<typeof itemVariantCategorySchema>;


export const itemVariantInsertSchema = createInsertSchema(itemVariants, {
  name: z.string().trim().min(1).max(127),
  price: z.number().nonnegative().transform(val => parseFloat(val.toFixed(2))),
}).omit({shopId: true, itemId: true, categoryId: true});

export type ItemVariantInsert = z.infer<typeof itemVariantInsertSchema>;

export const itemVariantSchema = createSelectSchema(itemVariants);
export type ItemVariant = z.infer<typeof itemVariantSchema>;

export const itemOptionCategoryInsertSchema = createInsertSchema(itemOptionCategories, {
  name: z.string().trim().min(1).max(127),
}).omit({shopId: true});
export type ItemOptionCategoryInsert = z.infer<typeof itemOptionCategoryInsertSchema>;

export const itemOptionCategorySchema = createSelectSchema(itemOptionCategories);
export type ItemOptionCategory = z.infer<typeof itemOptionCategorySchema>;
