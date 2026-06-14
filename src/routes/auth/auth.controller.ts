//Types

//Utils
import { eq } from "drizzle-orm";
import type { Context } from "hono";
import { createFactory } from "hono/factory";
import { sign, verify } from "hono/jwt";
import type z from "zod";
import { env } from "@/config/env";
import db from "@/db/connect";
import client from "@/db/redis";
import type { insertUserSchema } from "@/db/schema/user";
//Schemas
import userTable from "@/db/schema/user";

const factory = createFactory();

const signInController = factory.createHandlers(async (c: Context) => {
	//Obtenemos los datos validados y los tipamos usando el esquema de Zod
	const { email, password } = c.req.valid("json");

	try {
		//1. Verificar si el correo existe
		const [existingUser] = await db
			.select()
			.from(userTable)
			.where(eq(userTable.email, email))
			.limit(1);

		if (!existingUser) {
			return c.json({ message: "User not found", status: 404 }, 404);
		}

		//2. Verificar contraseña
		const isPasswordValid = await Bun.password.verify(
			password,
			existingUser.password,
		);

		if (!isPasswordValid) {
			return c.json({ message: "Invalid password", status: 401 }, 401);
		}

		//3. Generar Token
		const accessToken = await sign(
			{
				sub: existingUser.id,
				name: existingUser.name,
				exp: Math.floor(Date.now() / 1000) + 60 * 5, //5 Minutos
			},
			env.JWT_SECRET,
			"HS256",
		);

		//4 . Firmar el refreshToken
		const refreshToken = await sign(
			{
				sub: existingUser.id,
				name: existingUser.name,
				exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 1 Semana
			},
			env.JWT_REFRESH_SECRET,
			"HS256",
		);

		client.set(
			`token:${existingUser.id}`,
			refreshToken,
			"EX",
			60 * 60 * 24 * 7,
		);

		return c.json(
			{
				message: "Login successful",
				accessToken,
				refreshToken,
				status: 200,
			},
			200,
		);
	} catch (error) {
		console.log(error);
		return c.json({ message: "Internal server error", status: 500 }, 500);
	}
});

const signupController = factory.createHandlers(async (c: Context) => {
	// Obtenemos los datos validados y los tipamos usando el esquema de Zod
	const { name, email, password } = c.req.valid("json" as any) as z.infer<
		typeof insertUserSchema
	>;

	try {
		// 1. Verificar si el correo ya existe
		const [existingUser] = await db
			.select()
			.from(userTable)
			.where(eq(userTable.email, email))
			.limit(1);

		if (existingUser) {
			return c.json(
				{ message: "This email is already registered", status: 400 },
				400,
			);
		}

		// 2. Hashear contraseña de forma segura
		const hashedPassword = await Bun.password.hash(password, {
			algorithm: "bcrypt",
			cost: 10,
		});

		// 3. Insertar usuario en la base de datos
		const [createdUser] = await db
			.insert(userTable)
			.values({
				name,
				email,
				password: hashedPassword,
			})
			.returning({ id: userTable.id, name: userTable.name });

		// 4. Firmar el accessToken
		const accessToken = await sign(
			{
				sub: createdUser.id,
				name: createdUser.name,
				exp: Math.floor(Date.now() / 1000) + 60 * 5, //5 Minutos
			},
			env.JWT_SECRET,
			"HS256",
		);

		//5 . Firmar el refreshToken
		const refreshToken = await sign(
			{
				sub: createdUser.id,
				name: createdUser.name,
				exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 1 Semana
			},
			env.JWT_REFRESH_SECRET,
			"HS256",
		);

		client.set(`token:${createdUser.id}`, refreshToken, "EX", 60 * 60 * 24 * 7);

		return c.json(
			{
				message: "User created",
				accessToken,
				refreshToken,
				status: 201,
			},
			201,
		);
	} catch (error) {
		console.error(error);
		return c.json({ message: "Something went wrong", status: 500 }, 500);
	}
});

const refreshController = factory.createHandlers(async (c: Context) => {
	try {
		const { refreshToken } = c.req.valid("json" as any) as {
			refreshToken: string;
		};
		const token = (await verify(
			refreshToken,
			env.JWT_REFRESH_SECRET,
			"HS256",
		)) as {
			sub: string;
			name: string;
			exp: number;
		};

		const isTokenRedis = await client.get(`token:${token.sub}`);
		if (!isTokenRedis || isTokenRedis !== refreshToken) {
			return c.json({ message: "Invalid token", status: 401 }, 401);
		}

		const [user] = await db
			.select()
			.from(userTable)
			.where(eq(userTable.id, token.sub))
			.limit(1);

		if (!user) {
			return c.json({ message: "User not found", status: 404 }, 404);
		}

		const newAccessToken = await sign(
			{
				sub: user.id,
				name: user.name,
				exp: Math.floor(Date.now() / 1000) + 60 * 5, //5 Minutos
			},
			env.JWT_SECRET,
			"HS256",
		);

		const newRefreshToken = await sign(
			{
				sub: user.id,
				name: user.name,
				exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 1 Semana
			},
			env.JWT_REFRESH_SECRET,
			"HS256",
		);

		client.set(`token:${user.id}`, newRefreshToken, "EX", 60 * 60 * 24 * 7);

		return c.json(
			{
				message: "Token refreshed",
				accessToken: newAccessToken,
				refreshToken: newRefreshToken,
				status: 200,
			},
			200,
		);
	} catch (error) {
		console.log(error);
		return c.json({ message: "Internal server error", status: 500 }, 500);
	}
});

export { refreshController, signInController, signupController };
