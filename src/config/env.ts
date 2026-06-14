// src/config/env.ts
import { z } from "zod";

// 1. Definimos el esquema de lo que ESPERAMOS que tenga nuestro .env
const envSchema = z.object({
	DATABASE_URL: z.url("La URL de base de datos no es válida"),
	DATABASE_USER: z.string().min(1, "El usuario de DB es obligatorio"),
	DATABASE_PASSWORD: z.string().min(1, "La contraseña de DB es obligatoria"),
	JWT_SECRET: z
		.string()
		.min(8, "El JWT_SECRET debe tener al menos 8 caracteres"),
	PORT: z.string().default("3000").transform(Number), // Transforma el string "3000" a número 3000
	JWT_REFRESH_SECRET: z
		.string()
		.min(8, "El JWT_SECRET debe tener al menos 8 caracteres"),
	REDIS_URL: z.string().url("La URL de Redis no es válida"),
});

// 2. Validamos process.env contra el esquema
const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
	console.error("❌ Error en las variables de entorno:");
	// Muestra de forma bonita qué variables faltan o están mal
	console.error(JSON.stringify(parsedEnv.error.format(), null, 2));
	process.exit(1); // Detiene el servidor de inmediato
}

// 3. Exportamos las variables validadas y tipadas
export const env = parsedEnv.data;
