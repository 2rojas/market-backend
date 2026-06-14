import { Hono } from "hono";
import apiRouter from "@/routes";

const app = new Hono();

app.get("/", (c) => {
	return c.text("Hello Hono!");
});

// Registrar todas las rutas bajo el prefijo /api
app.route("/api", apiRouter);

//Api Not found
app.notFound((c) => {
	return c.json({ message: "Not found", status: 404 }, 404);
});

export default app;
