// Hono

// Validators
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import z from "zod";
// Schemas
import { insertUserSchema } from "@/db/schema/user";
// Controllers
import {
	refreshController,
	signInController,
	signupController,
} from "@/routes/auth/auth.controller";

const authRouter = new Hono();

authRouter.post(
	"/signin",
	zValidator("json", insertUserSchema),
	...signInController,
);
authRouter.post(
	"/signup",
	zValidator("json", insertUserSchema),
	...signupController,
);

authRouter.post(
	"/refresh",
	zValidator("json", z.object({ refreshToken: z.string() })),
	...refreshController,
);

export default authRouter;
