// Validators
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
// Schemas
import { insertProductSchema } from "@/db/schema/products";
import authMiddleware from "@/middlewares/auth";
// Controllers
import {
	createProduct,
	deleteProduct,
	getProduct,
	getProductById,
	updateProduct,
} from "./product.controller";

const productRouter = new Hono();

// Rutas públicas
productRouter.get("/", ...getProduct);
productRouter.get("/:id", ...getProductById);

// Rutas protegidas
productRouter.post(
	"/create",
	authMiddleware,
	zValidator("json", insertProductSchema.omit({ ownerId: true })),
	...createProduct,
);
productRouter.delete("/:id", authMiddleware, ...deleteProduct);
productRouter.put(
	"/:id",
	authMiddleware,
	zValidator("json", insertProductSchema.omit({ ownerId: true })),
	...updateProduct,
);

export default productRouter;
