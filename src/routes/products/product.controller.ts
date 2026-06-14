// Schemes and DB
import db from "@/db/connect";
import productTable from "@/db/schema/products";
import { eq } from "drizzle-orm";

//Types
import type { Context } from "hono";

//Factory
import { createFactory } from "hono/factory";

const factory = createFactory();

const createProduct = factory.createHandlers(async (c: Context) => {
	const { name, description, price, stock, category } = c.req.valid("json");

	const user = c.get("user");

	if (!user) return c.json({ message: "Unauthorized" }, 401);

	const [createdProduct] = await db
		.insert(productTable)
		.values({
			name,
			description,
			price,
			stock,
			category,
			ownerId: user.id,
		})
		.returning();

	return c.json({ createdProduct });
});

const getProduct = factory.createHandlers(async (c: Context) => {
	const category = c.req.query("category");
	const limitStr = c.req.query("limit");
	const pageStr = c.req.query("page");

	if (category) {
		const products = await db
			.select()
			.from(productTable)
			.where(eq(productTable.category, category));
		return c.json({ products });
	}

	if (limitStr && pageStr) {
		const limit = parseInt(limitStr) || 50;
		const page = parseInt(pageStr) || 1;

		// CORRECCIÓN DE BUG: El offset es (página - 1) * límite, no el número de la página directo
		const offset = (page - 1) * limit;

		const products = await db
			.select()
			.from(productTable)
			.limit(limit)
			.offset(offset);
		return c.json({ products });
	}

	const products = await db.select().from(productTable).limit(50).offset(0);
	return c.json({ products });
});

const getProductById = factory.createHandlers(async (c: Context) => {
	const { id } = c.req.param();
	const [product] = await db
		.select()
		.from(productTable)
		.where(eq(productTable.id, parseInt(id)));

	if (!product) {
		return c.json({ message: "Product not found" }, 404);
	}

	return c.json({ product });
});

const deleteProduct = factory.createHandlers(async (c: Context) => {
	const user = c.get("user");
	if (!user) return c.json({ message: "Unauthorized" }, 401);

	const id = c.req.param("id");

	const [product] = await db
		.select()
		.from(productTable)
		.where(eq(productTable.id, id));

	if (!product) {
		return c.json({ message: "Product not found" }, 404);
	}
	if (product.ownerId !== user.id) {
		return c.json({ message: "You are not the owner of this product" }, 403);
	}

	const [deletedProduct] = await db
		.delete(productTable)
		.where(eq(productTable.id, id))
		.returning();
	return c.json({ deletedProduct });
});

const updateProduct = factory.createHandlers(async (c: Context) => {
	const body = c.req.valid("json");
	const user = c.get("user");
	if (!user) return c.json({ message: "Unauthorized" }, 401);

	const id = c.req.param("id");

	const [product] = await db
		.select()
		.from(productTable)
		.where(eq(productTable.id, id));

	if (!product) {
		return c.json({ message: "Product not found" }, 404);
	}
	if (product.ownerId !== user.id) {
		return c.json({ message: "You are not the owner of this product" }, 403);
	}

	const [updatedProduct] = await db
		.update(productTable)
		.set(body)
		.where(eq(productTable.id, id))
		.returning();

	return c.json({ updatedProduct });
});

export {
	createProduct,
	getProduct,
	getProductById,
	deleteProduct,
	updateProduct,
};
