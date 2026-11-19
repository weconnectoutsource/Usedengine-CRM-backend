import express, { Request, Response } from 'express'
import { registerRoute } from './registerRoute'
import { userRouter } from './userRouter'

const router = express.Router()

registerRoute(router, {
  method: 'get',
  path: '/health-check',
  swaggerPath: '/health-check',
  handler: (_req: Request, res: Response) => {
    res.status(200).json({ status: true, message: 'Working Fine!' })
  },
  summary: 'Health check',
  tags: ['Health-check'],
  responses: { 200: { description: 'Service is running' } },
})

router.use('/users', userRouter)

export default router
