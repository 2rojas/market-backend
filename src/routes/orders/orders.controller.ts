
//Types
import type { Context } from "hono";

//Schemas
import orderTable from "@/db/schema/orders";
import productsInOrderTable from "@/db/schema/productsInOrder";

//Utils
import db from "@/db/connect";
import { createFactory } from "hono/factory";
import { eq, desc } from "drizzle-orm";

const factory = createFactory();


const createOrderController = factory.createHandlers(async (c: Context) => {
    try{
        const { products } = c.req.valid("json" as any) as { products: Array<{ id: string; price: number; quantity: number }> };
        const idempotencyKey = c.req.header("Idempotency-Key");
        const user = c.get("user");

        //Calcular total
        const totalAmount = products.reduce((acc: number, product: { price: number; quantity: number }) => acc + product.price * product.quantity, 0)

        //Crear orden
        const [ order ] = await db
            .insert(orderTable)
            .values({
                userId: user.sub,
                totalAmount: String(totalAmount),
                idempotencyKey,
                status: "PENDING",
            })
            .returning();

        //Crear productos en orden
        const productsInOrder = products.map((product) => ({
            orderId: order.id,
            productId: product.id,
            quantity: String(product.quantity), // Drizzle 'numeric' espera string
            price: String(product.price),       // Drizzle 'numeric' espera string
        }));

        await db.insert(productsInOrderTable).values(productsInOrder);

        return c.json({ message: "Order created successfully", status: 201 }, 201);
    }catch(error){
        console.log(error)
        return c.json({ message: "Internal server error", status: 500 }, 500)
    }
})

const getAllOrdersController = factory.createHandlers(async (c: Context) => {
    try{
        const user = c.get("user");

        const orders = await db
            .select()
            .from(orderTable)
            .where(eq(orderTable.userId, user.sub))
            .orderBy(desc(orderTable.createdAt)); 


        return c.json({ message: "Orders retrieved successfully", status: 200, data: orders }, 200);
    }catch(error){
        console.log(error)
        return c.json({ message: "Internal server error", status: 500 }, 500)
    }
})

export { createOrderController, getAllOrdersController }