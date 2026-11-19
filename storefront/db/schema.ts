// Intentionally empty by default.
// Add Drizzle tables here when the site actually needs a database.
// See examples/d1/db/schema.ts for an opt-in example.
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const storeSettings = sqliteTable('store_settings', { id: integer('id').primaryKey(), value: text('value').notNull(), revision: integer('revision').notNull(), updatedAt: text('updated_at').notNull() });
export const storeAdmin = sqliteTable('store_admin', { id: integer('id').primaryKey(), userId: text('user_id').notNull() });
export const storeOrders = sqliteTable('store_orders', {id:text('id').primaryKey(),customer:text('customer').notNull(),phone:text('phone').notNull(),items:text('items').notNull(),totalMinor:integer('total_minor').notNull(),currency:text('currency').notNull(),recordType:text('record_type').notNull().default('sale'),status:text('status').notNull().default('pending'),createdAt:text('created_at').notNull(),updatedAt:text('updated_at').notNull()});

export const customerOrders=sqliteTable('customer_orders',{payment:text('payment').notNull().default('{}'),id:text('id').primaryKey(),requestKey:text('request_key').notNull().unique(),customer:text('customer').notNull(),phone:text('phone').notNull(),district:text('district').notNull(),area:text('area').notNull(),address:text('address').notNull(),items:text('items').notNull(),subtotalMinor:integer('subtotal_minor').notNull(),deliveryMinor:integer('delivery_minor').notNull(),totalMinor:integer('total_minor').notNull(),currency:text('currency').notNull().default('BDT'),status:text('status').notNull().default('pending'),courier:text('courier').notNull(),tracking:text('tracking').notNull().default(''),createdAt:text('created_at').notNull(),updatedAt:text('updated_at').notNull()});

export const requestLimits=sqliteTable('request_limits',{key:text('key').primaryKey(),window:integer('window').notNull(),count:integer('count').notNull()});
