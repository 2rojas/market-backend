// Hono

// Validators
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import z from "zod";
// Schemas
import { insertUserSchema } from "@/db/schema/user";
// Controllers
import {
	forgotPasswordController,
	refreshController,
	resetPasswordController,
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

authRouter.post(
	"/forgot-password",
	zValidator("json", z.object({ email: z.email() })),
	...forgotPasswordController,
);

authRouter.post(
	"/reset-password/:token",
	zValidator("param", z.object({ token: z.string() })),
	zValidator("json", z.object({ password: z.string() })),
	...resetPasswordController, 
);

export default authRouter;
