import authMiddleware from '@/middlewares/auth'
import { Hono } from 'hono'

// Controllers
import { 
    createProduct,
    getProduct,
    getProductById,
    deleteProduct,
    updateProduct 
} from './product.controller'

// Validators
import { zValidator } from '@hono/zod-validator'

// Schemas
import { insertProductSchema } from '@/db/schema/products'

const productRouter = new Hono()

// Rutas públicas
productRouter.get('/',  ...getProduct)
productRouter.get('/:id',  ...getProductById)

// Rutas protegidas 
productRouter.post('/create', authMiddleware, zValidator('json', insertProductSchema.omit({ ownerId: true})), ...createProduct)
productRouter.delete('/:id', authMiddleware, ...deleteProduct)
productRouter.put('/:id', authMiddleware, zValidator('json', insertProductSchema.omit({ ownerId: true})), ...updateProduct)

export default productRouter

