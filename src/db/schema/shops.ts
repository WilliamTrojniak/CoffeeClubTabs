import { integer, pgTable, serial, text, unique, varchar } from "drizzle-orm/pg-core";
import { users } from "./users";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
import { itemCategories } from "./items";

export const shops = pgTable('shops', {
  id: serial('id').primaryKey(),
  ownerId: text('owner_id').references(() => users.id).notNull(),
  name: varchar('name', {length: 255}).notNull(),
}, (table) => {
    return {
      unq: unique().on(table.ownerId, table.name), // Users must have locally unique shop names
    }
});

export const shopsRelations = relations(shops, ({one, many}) => {
  return {
    owner: one(users, {
      fields: [shops.ownerId],
      references: [users.id],
    }),
    itemCategories: many(itemCategories),
    paymentOptions: many(paymentOptions),
  }
});

export const paymentOptions = pgTable('payment_options', {
  id: serial('id').primaryKey(),
  shopId: integer('shop_id').references(() => shops.id).notNull(),
  name: varchar('name', {length: 255}).notNull(),
}, table => {
    return {
      unq: unique().on(table.shopId, table.name), // Shops payment option name must be unique to the shop
    }
});

export const paymentOptionsRelations = relations(paymentOptions, ({one}) => {
  return {
    shop: one(shops, {
      fields: [paymentOptions.shopId],
      references: [shops.id]
    }),
  }
});

export const shopInsertSchema = createInsertSchema(shops);
export type ShopInsert = z.infer<typeof shopInsertSchema>;

export const shopSelectSchema = createSelectSchema(shops);
export type Shop = z.infer<typeof shopSelectSchema>;


export const shopPaymentOptionInsertSchema = createInsertSchema(paymentOptions);
export type ShopPaymentOptionInsertData = z.infer<typeof shopPaymentOptionInsertSchema>;

export const shopPaymentOptionSelectSchema = createSelectSchema(paymentOptions);
export type ShopPaymentOption = z.infer<typeof shopPaymentOptionSelectSchema>;
