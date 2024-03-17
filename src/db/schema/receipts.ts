import { date, integer, pgTable, primaryKey, serial, time } from "drizzle-orm/pg-core";
import { tabs } from "./tabs";
import { itemVariants, items } from "./items";
import { foreignKey } from "drizzle-orm/pg-core";


// used for storing unpaid items
export const orders = pgTable('orders', {
  shopId: integer('shop_id').notNull(),
  tabId: integer('tab_id').notNull(),
  itemId: integer('item_id').notNull(),
  quantity: integer('quantity').default(0).notNull(),
}, (table) => {
    return {
      pk: primaryKey({columns: [table.shopId, table.tabId, table.itemId]}),
      tab_fk: foreignKey({
        columns: [table.shopId, table.tabId],
        foreignColumns: [tabs.shopId, tabs.id],
      }),
      item_fk: foreignKey({
        columns: [table.shopId, table.itemId],
        foreignColumns: [items.shopId, items.id],
      })
    }
});

// used for storing unpaid variants of items
export const ordersVariants = pgTable('orders_variants', {
  shopId: integer('shop_id').notNull(),
  tabId: integer('tab_id').notNull(),
  itemId: integer('item_id').notNull(),
  categoryId: integer('category_id').notNull(),
  variantId: integer('variant_id').notNull(),
  quantity: integer('quantity').default(0).notNull(),
}, (table) => {
    return {
      pk: primaryKey({columns: [table.shopId, table.tabId, table.itemId, table.categoryId, table.variantId]}),
      tab_fk: foreignKey({
        columns: [table.shopId, table.tabId],
        foreignColumns: [tabs.shopId, tabs.id],
      }),
      variant_fk: foreignKey({
        columns: [table.shopId, table.itemId, table.categoryId, table.variantId],
        foreignColumns: [itemVariants.shopId, itemVariants.itemId, itemVariants.categoryId, itemVariants.id],
      }),
    }
});

export const paidOrders = pgTable('paid_orders', {
  shopId: integer('shop_id').notNull(),
  tabId: integer('tab_id').notNull(),
  itemId: integer('item_id').notNull(),
  date: date('date').defaultNow().notNull(),
  time: time('time').defaultNow().notNull(),
  quantity: integer('quantity').default(0).notNull(),
}, (table) => {
    return {
      pk: primaryKey({columns: [table.shopId, table.tabId, table.itemId, table.date, table.time]}),
      tab_fk: foreignKey({
        columns: [table.shopId, table.tabId],
        foreignColumns: [tabs.shopId, tabs.id],
      }),
      item_fk: foreignKey({
        columns: [table.shopId, table.itemId],
        foreignColumns: [items.shopId, items.id],
      })
    }
});

export const paidOrdersVariants = pgTable('paid_orders_variants', {
  shopId: integer('shop_id').notNull(),
  tabId: integer('tab_id').notNull(),
  itemId: integer('item_id').notNull(),
  categoryId: integer('category_id').notNull(),
  variantId: integer('variant_id').notNull(),
  date: date('date').defaultNow().notNull(),
  time: time('time').defaultNow().notNull(),
  quantity: integer('quantity').notNull(),
}, (table) => {
    return {
      pk: primaryKey({columns: [table.shopId, table.tabId, table.itemId, table.categoryId, table.variantId, table.date, table.time]}),
      tab_fk: foreignKey({
        columns: [table.shopId, table.tabId],
        foreignColumns: [tabs.shopId, tabs.id],
      }),
      variant_fk: foreignKey({
        columns: [table.shopId, table.itemId, table.categoryId, table.variantId],
        foreignColumns: [itemVariants.shopId, itemVariants.itemId, itemVariants.categoryId, itemVariants.id],
      }),
    }
});
