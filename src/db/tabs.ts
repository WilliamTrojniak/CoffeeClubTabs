import { date, pgEnum, pgTable, serial, text, time, varchar } from "drizzle-orm/pg-core";
import { users } from "./users";
import { smallint } from "drizzle-orm/mysql-core";

export const daysOfWeekEnum = pgEnum('days_of_week', 
  ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']);

export const tabOrderLimitOptionsEnum = pgEnum('tab_order_limit_options',
  ['N/A', 'Dollar Limit', 'Single Drink', 'Single Drink or Pastry', 'Single Drink and Pastry']);

export const tabVerificationMethodsEnum = pgEnum('tab_verification_methods', 
  ['Specify', 'Email', 'List', 'QR Code', 'Voucher']);

export const tabPaymentMethodsEnum = pgEnum('tab_payment_methods', ['Credit Card', 'University Chartstring']);

export const tabs = pgTable("tabs", {
  id: serial('id').primaryKey(),
  ownerId: text('owner_id').references(() => users.id).notNull(),
  organization: varchar("organization", {length: 255}).notNull(),
  displayName: varchar("display_name", {length: 255}).notNull(),
  startDate: date("start_date").notNull(),
  endDtate: date("end_date").notNull(),
  dailyStartTime: time('daily_start_time').notNull(),
  dailyEndTime: time('daily_end_time').notNull(),
  activeDaysOfWeek: daysOfWeekEnum('active_days_of_week').array(), // TODO this needs to change to allow for multiple
  orderLimit: tabOrderLimitOptionsEnum('order_limit').notNull(),
  dollarLimitPerOrder: smallint('limit_per_order'),
  verificationMethod: tabVerificationMethodsEnum('verification_method').notNull(),
  verificationList: varchar('verification_list').array(),
  paymentMethod: tabPaymentMethodsEnum('payment_method').notNull(), // TODO restrict these values to values available in shop table
  paymentDetails: varchar('payment_details', {length: 255}), // TODO find out how to make this required based on payment method
});


