import { boolean, date, foreignKey, pgEnum, pgTable, primaryKey, serial, smallint, text, time, varchar } from "drizzle-orm/pg-core";
import { users } from "./users";
import { paymentOptions, shops } from "./shops";
import { collectAppConfig } from "next/dist/build/utils";

export const daysOfWeekEnum = pgEnum('days_of_week', 
  ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']);

export const tabOrderLimitOptionsEnum = pgEnum('tab_order_limit_options',
  ['N/A', 'Dollar Limit', 'Single Drink', 'Single Drink or Pastry', 'Single Drink and Pastry']);

export const tabVerificationMethodsEnum = pgEnum('tab_verification_methods', 
  ['Specify', 'Email', 'List', 'QR Code', 'Voucher']);

export const tabStatusEnum = pgEnum('tab_status_enum',
  ['Awaiting Confirmation', 'Confirmed', 'Closed']);


export const tabs = pgTable("tabs", {
  shopId: serial('shop_id').notNull(),
  id: serial('id').notNull(),
  ownerId: text('owner_id').notNull(),
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
  paymentMethod: serial('payment_method').notNull(), 
  paymentDetails: varchar('payment_details', {length: 255}), // TODO find out how to make this required based on payment method
  status: tabStatusEnum('status').notNull().default(tabStatusEnum.enumValues[0]),
}, table => {
    return {
      pk: primaryKey({columns: [table.shopId, table.id]}),
      owner_fk: foreignKey({
        columns: [table.ownerId],
        foreignColumns: [users.id],
      }),
      payment_fk: foreignKey({
        columns: [table.shopId, table.paymentMethod],
        foreignColumns: [paymentOptions.shopId, paymentOptions.id],
      }),
    }
  }
);


