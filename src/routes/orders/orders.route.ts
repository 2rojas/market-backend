import { Hono } from "hono";

//Controllers
import {
	createOrderController,
    getAllOrdersController,
    getOrderByIdController
} from "@/routes/orders/orders.controller";

//Schemas
import { insertOrderSchema } from "@/db/schema/orders";
import z from "zod";

//Validators
import { zValidator } from "@hono/zod-validator";
import authMiddleware from "@/middlewares/auth";

const orderRouter = new Hono();

orderRouter.post("/create", authMiddleware, zValidator("json", insertOrderSchema), ...createOrderController);

orderRouter.get("/", authMiddleware, ...getAllOrdersController);

orderRouter.get("/:id", authMiddleware, zValidator("param", z.object({ id: z.uuid() })), ...getOrderByIdController);

export default orderRouter;