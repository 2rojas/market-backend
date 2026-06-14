import { pgTable, text, integer, uuid, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import userTable from "./user";
import productTable from "./products";

const reviewTable = pgTable("reviews", {
	id: uuid().defaultRandom().primaryKey(),
	rating: integer().notNull(),
	review: text().notNull(),
	createdAt: timestamp({ withTimezone: true, mode: "date" }).defaultNow(),
	updatedAt: timestamp({ withTimezone: true, mode: "date" }).defaultNow(),
	userId: uuid()
		.notNull()
		.references(() => userTable.id, { onDelete: "cascade" }),
	productId: uuid()
		.notNull()
		.references(() => productTable.id, { onDelete: "cascade" }),
});

export const insertReviewSchema = createInsertSchema(reviewTable, {
	rating: z
		.number()
		.int()
		.min(1, "La calificación mínima es 1")
		.max(5, "La calificación máxima es 5"),
	review: z
		.string()
		.min(5, "La reseña debe tener al menos 5 caracteres")
		.max(2000, "La reseña no puede exceder los 2000 caracteres"),
});

export const selectReviewSchema = createSelectSchema(reviewTable);

export default reviewTable;
