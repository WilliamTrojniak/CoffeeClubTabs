import { date, integer, pgTable, primaryKey, serial, time } from "drizzle-orm/pg-core";
import { tabs } from "./tabs";
import { itemVariants, items } from "./items";


// used for storing unpaid items
export const orders = pgTable('orders', {
  tabId: serial('tab_id').references(() => tabs.id),
  itemId: serial('item_id').references(() => items.id),
  quantity: integer('quantity').default(0).notNull(),
}, (table) => {
    return {
      pk: primaryKey({columns: [table.tabId, table.itemId]}),
    }
});

// used for storing unpaid variants of items
export const ordersVariants = pgTable('orders_variants', {
  tabId: serial('tab_id').references(() => tabs.id),
  variantId: serial('variant_id').references(() => itemVariants.id),
  quantity: integer('quantity').default(0).notNull(),
}, (table) => {
    return {
      pk: primaryKey({columns: [table.tabId, table.variantId]}),
    }
});

export const paidOrders = pgTable('paid_orders', {
  tabId: serial('tab_id').references(() => tabs.id),
  itemId: serial('item_id').references(() => items.id),
  date: date('date').defaultNow().notNull(),
  time: time('time').defaultNow().notNull(),
  quantity: integer('quantity').notNull(),
}, (table) => {
    return {
      pk: primaryKey({columns: [table.tabId, table.itemId, table.date, table.time]}),
    }
});

export const paidOrdersVariants = pgTable('paid_orders_variants', {
  tabId: serial('tab_id').references(() => tabs.id),
  variantId: serial('variant_id').references(() => itemVariants.id),
  date: date('date').defaultNow().notNull(),
  time: time('time').defaultNow().notNull(),
  quantity: integer('quantity').notNull(),
}, (table) => {
    return {
      pk: primaryKey({columns: [table.tabId, table.variantId, table.date, table.time]}),
    }
});
