import {
	pgTable,
	varchar,
	integer,
	timestamp,
	text,
	decimal,
	uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import userTable from "./user";

const productTable = pgTable("products", {
	id: uuid().defaultRandom().primaryKey(),
	name: varchar({ length: 30 }).notNull(),
	description: text().default("No info yet"),
	price: decimal("price", { precision: 8, scale: 2 }).notNull(),
	stock: integer().notNull(),
	category: varchar({ length: 50 }).notNull(),
	createdAt: timestamp({ withTimezone: true, mode: "date" }).defaultNow(),
	updatedAt: timestamp({ withTimezone: true, mode: "date" }).defaultNow(),
	ownerId: uuid()
		.notNull()
		.references(() => userTable.id, { onDelete: "cascade" }),
	rating: integer().default(0).notNull(),
});

export const insertProductSchema = createInsertSchema(productTable, {
	name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(30),
	description: z.string().max(1000).optional(),
	price: z
		.number()
		.positive("El precio debe ser mayor a 0")
		.transform((value) => parseFloat(value.toFixed(2))),
	stock: z.number().positive("El stock debe ser mayor a 0"),
	category: z
		.string()
		.min(2, "La categoría debe tener al menos 2 caracteres")
		.max(50),
});

export const selectProductSchema = createSelectSchema(productTable);

export type Product = typeof productTable.$inferSelect;
export type NewProduct = typeof productTable.$inferInsert;

export default productTable;
