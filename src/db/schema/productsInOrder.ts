import { pgTable, timestamp, uuid, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

//Schemas
import ordersTable from "@/db/schema/orders";
import productsTable from "@/db/schema/products";
import { relations } from "drizzle-orm";

const productsInOrderTable = pgTable("productsInOrder", {
    id: uuid().defaultRandom().primaryKey(),
    orderId: uuid().notNull().references(() => ordersTable.id, { onDelete: 'cascade'}),
    productId: uuid().notNull().references(() => productsTable.id, { onDelete: 'cascade'}),
    quantity: numeric().notNull(),
    price: numeric().notNull(),
    createdAt: timestamp({ withTimezone: true, mode: "date" }).defaultNow(),
    updatedAt: timestamp({ withTimezone: true, mode: "date" }).defaultNow(),
})


export const ordersRelation = relations(productsInOrderTable, ({ one }) => ({
    order: one(ordersTable, {
        fields: [productsInOrderTable.orderId],
        references: [ordersTable.id],
    }), 
    product: one(productsTable, {
        fields: [productsInOrderTable.productId],
        references: [productsTable.id],
    }),
}))

export const insertProductInOrderSchema = createInsertSchema(productsInOrderTable, {
    orderId: z.uuid(),
    productId: z.uuid(),
    quantity: z.string().regex(/^\d+(\.\d+)?$/),
    price: z.string().regex(/^\d+(\.\d+)?$/),
})

export const selectProductInOrderSchema = createSelectSchema(productsInOrderTable).omit({
    quantity: true,
    price: true,
})

export default productsInOrderTable;