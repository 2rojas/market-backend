import { relations } from "drizzle-orm";
import {
	numeric,
	pgTable,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import productsInOrderTable from "@/db/schema/productsInOrder";
//Schemas
import userTable from "@/db/schema/user";

const ordersTable = pgTable("orders", {
	id: uuid().defaultRandom().primaryKey(),
	userId: uuid().references(() => userTable.id, { onDelete: "set null" }),
	totalAmount: numeric().notNull(),
	status: varchar({ length: 255 }).notNull(),
	idempotencyKey: varchar({ length: 255 }).unique().notNull(),
	createdAt: timestamp({ withTimezone: true, mode: "date" }).defaultNow(),
	updatedAt: timestamp({ withTimezone: true, mode: "date" }).defaultNow(),
});

export const ordersRelation = relations(ordersTable, ({ one, many }) => ({
	user: one(userTable, {
		fields: [ordersTable.userId],
		references: [userTable.id],
	}),
	products: many(productsInOrderTable),
}));

export const insertOrderSchema = createInsertSchema(ordersTable, {
	userId: z.uuid(),
	totalAmount: z.string().regex(/^\d+(\.\d+)?$/),
	status: z.enum(["PENDING", "SHIPPED", "DELIVERED", "CANCELLED"]),
});

export const selectOrderSchema = createSelectSchema(ordersTable).omit({
	totalAmount: true,
	status: true,
});

export default ordersTable;
