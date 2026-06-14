//Validators
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import z from "zod";
//Schemas
import { insertOrderSchema } from "@/db/schema/orders";
import authMiddleware from "@/middlewares/auth";
//Controllers
import {
	createOrderController,
	getAllOrdersController,
	getOrderByIdController,
	cancelOrderController,
} from "@/routes/orders/orders.controller";

const orderRouter = new Hono();

orderRouter.post(
	"/create",
	authMiddleware,
	zValidator("json", insertOrderSchema),
	...createOrderController,
);

orderRouter.get("/", authMiddleware, ...getAllOrdersController);

orderRouter.get(
	"/:id",
	authMiddleware,
	zValidator("param", z.object({ id: z.uuid() })),
	...getOrderByIdController,
);

orderRouter.patch(
	"/:id/cancel",
	authMiddleware,
	zValidator("param", z.object({ id: z.uuid() })),
	...cancelOrderController,
);

export default orderRouter;
