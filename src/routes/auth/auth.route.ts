// Hono
import { Hono } from "hono";

// Validators
import { zValidator } from "@hono/zod-validator";

// Schemas
import { insertUserSchema } from "@/db/schema/user";

// Controllers
import {
	signInController,
	signupController,
	refreshController
} from "@/routes/auth/auth.controller";
import z from "zod";

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
