import { pgTable, varchar, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

const userTable = pgTable('users', {
    id: uuid().defaultRandom().primaryKey(),
    name: varchar({ length: 255 }).notNull(),
    email: varchar({ length: 255 }).notNull().unique(),
    password: varchar({ length: 255 }).notNull(),
    createdAt: timestamp({ withTimezone: true, mode: 'date' }).defaultNow(),
    updatedAt: timestamp({ withTimezone: true, mode: 'date' }).defaultNow()
})

export const insertUserSchema = createInsertSchema(userTable, {
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(255),
    email: z.email("El formato de correo es inválido").max(255),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").max(255).trim(),
});

export const selectUserSchema = createSelectSchema(userTable).omit({ password: true });

export default userTable


