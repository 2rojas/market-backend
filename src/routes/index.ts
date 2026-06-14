import { Hono } from "hono";

//Routes
import authRouter from "./auth/auth.route";
import orderRouter from "./orders/orders.route";
import productRouter from "./products/product.route";

const router = new Hono();

router.route("/auth", authRouter);
router.route("/product", productRouter);
router.route("/order", orderRouter);

export default router;
