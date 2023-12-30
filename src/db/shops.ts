import { pgTable, serial, text, unique, varchar } from "drizzle-orm/pg-core";
import { users } from "./users";

export const shops = pgTable('shops', {
  id: serial('id').primaryKey(),
  ownerId: text('owner_id').references(() => users.id).notNull(),
  name: varchar('name', {length: 255}).notNull(),
}, (table) => {
    return {
      unq: unique().on(table.ownerId, table.name), // Users must have locally unique shop names
    }
});

export const paymentOptions = pgTable('payment_options', {
  id: serial('id').primaryKey(),
  shopId: serial('shop_id').references(() => shops.id).notNull(),
  name: varchar('name', {length: 255}).notNull(),
}, table => {
    return {
      unq: unique().on(table.shopId, table.name), // Shops payment option name must be unique to the shop
    }
});
