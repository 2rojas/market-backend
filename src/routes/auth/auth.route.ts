import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'

//Schemas
import { insertUserSchema } from '@/db/schema/user'

//Controller
import { signInController, signupController } from '@/routes/auth/auth.controller'

const authRouter = new Hono()

authRouter.post('/signin', zValidator('json', insertUserSchema), ...signInController)
authRouter.post('/signup', zValidator('json', insertUserSchema), ...signupController)

export default authRouter