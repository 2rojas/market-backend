//Types
import type { Context } from "hono";

//Schemas
import orderTable from "@/db/schema/orders";
import productsInOrderTable from "@/db/schema/productsInOrder";
import productTable from "@/db/schema/products";

//Utils
import db from "@/db/connect";
import { createFactory } from "hono/factory";
import { eq, desc, inArray, and } from "drizzle-orm";

const factory = createFactory();


const createOrderController = factory.createHandlers(async (c: Context) => {
    try{
        const { products } = c.req.valid("json" as any) as { products: Array<{ id: string; price: number; quantity: number }> };

        const idempotencyKey = c.req.header("Idempotency-Key");
        if (!idempotencyKey) return c.json({ message: "Idempotency-Key header is required", status: 400 }, 400);
        
        
        const user = c.get("user");

        //Calcular total
        const totalAmount = products.reduce((acc: number, product: { price: number; quantity: number }) => acc + product.price * product.quantity, 0)

        // Buscar si los productos existen y tienen stock
        const stockProducts = await db.select().from(productTable).where(inArray(productTable.id, products.map(p => p.id)))

        if (stockProducts.length !== products.length) {
            return c.json({ message: "Some products do not exist", status: 404 }, 404)
        }

        for (const product of products) {
            const stockProduct = stockProducts.find(p => p.id === product.id)!;
            if (stockProduct.stock < product.quantity) {
                return c.json({ message: "Product out of stock", status: 400 }, 400)
            }
        }

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
            quantity: String(product.quantity),
            price: String(product.price),
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

const getOrderByIdController = factory.createHandlers(async (c: Context) => {
    try{
        const { id } = c.req.param();
        const user = c.get("user");

        const order = await db
            .select()
            .from(orderTable)
            .where(and(eq(orderTable.id, id), eq(orderTable.userId, user.sub)))
            .limit(1);

        if (!order) return c.json({ message: "Order not found", status: 404 }, 404);

        return c.json({ message: "Order retrieved successfully", status: 200, data: order }, 200);
    }catch(error){
        console.log(error)
        return c.json({ message: "Internal server error", status: 500 }, 500)
    }
})

export { createOrderController, getAllOrdersController, getOrderByIdController }