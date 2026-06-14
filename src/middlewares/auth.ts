//Types
import type { Context, Next } from "hono";
import { createMiddleware } from "hono/factory";
//Utils
import { verify } from "hono/jwt";
import { env } from "@/config/env";

const authMiddleware = createMiddleware(async (c: Context, next: Next) => {
    
    const authHeader = c.req.header("Authorization")
    const token = authHeader?.split(" ")[1]

    if (!token) {
        return c.json({ message: "Unauthorized", status: 401 }, 401)
    }
    //Decodificamos
    const decodedToken = await verify(token, env.JWT_SECRET, 'HS256')

    if (!decodedToken) {
        return c.json({ message: "Unauthorized", status: 401 }, 401)
    }

    c.set("user", {
        id: decodedToken.sub,
        name: decodedToken.name,
    })
    await next()
})

export default authMiddleware