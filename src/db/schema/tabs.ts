import { boolean, date, pgEnum, pgTable, primaryKey, serial, smallint, text, time, varchar } from "drizzle-orm/pg-core";
import { users } from "./users";
import { paymentOptions, shops } from "./shops";

export const daysOfWeekEnum = pgEnum('days_of_week', 
  ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']);

export const tabOrderLimitOptionsEnum = pgEnum('tab_order_limit_options',
  ['N/A', 'Dollar Limit', 'Single Drink', 'Single Drink or Pastry', 'Single Drink and Pastry']);

export const tabVerificationMethodsEnum = pgEnum('tab_verification_methods', 
  ['Specify', 'Email', 'List', 'QR Code', 'Voucher']);

export const tabStatusEnum = pgEnum('tab_status_enum',
  ['Awaiting Confirmation', 'Confirmed', 'Closed']);


export const tabs = pgTable("tabs", {
  id: serial('id').primaryKey(),
  shopId: serial('shop_id').references(() => shops.id).notNull(),
  ownerId: text('owner_id').references(() => users.id).notNull(),
  organization: varchar("organization", {length: 255}).notNull(),
  displayName: varchar("display_name", {length: 255}).notNull(),
  startDate: date("start_date").notNull(),
  endDtate: date("end_date").notNull(),
  dailyStartTime: time('daily_start_time').notNull(),
  dailyEndTime: time('daily_end_time').notNull(),
  activeDaysOfWeek: daysOfWeekEnum('active_days_of_week').array(), 
  orderLimit: tabOrderLimitOptionsEnum('order_limit').notNull(),
  dollarLimitPerOrder: smallint('limit_per_order'), // TODO Find out how to make this required based on orderLimit
  verificationMethod: tabVerificationMethodsEnum('verification_method').notNull(),
  verificationList: varchar('verification_list', {length: 255}).array(),
  paymentMethod: serial('payment_method').references(() => paymentOptions.id).notNull(), 
  paymentDetails: varchar('payment_details', {length: 255}), // TODO find out how to make this required based on payment method
  status: tabStatusEnum('status').notNull().default(tabStatusEnum.enumValues[0]),

});


