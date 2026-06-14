import { Hono } from 'hono'

//Routes
import authRouter from './auth/auth.route'
import productRouter from './products/product.route'

const router = new Hono()


router.route('/auth', authRouter)
router.route('/product', productRouter)

export default router
