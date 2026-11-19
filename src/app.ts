import express, { NextFunction, Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import api from './routes'
import { setupSwagger } from './swagger'
import { sequelize } from './config/database'

dotenv.config()

process.on('uncaughtException', (err) => {
  console.error('[uncaughtException]', err)
})
process.on('unhandledRejection', (reason) => {
  console.error('[unhandledRejection]', reason)
})

const app = express()

const trustProxyHops = Number(process.env.TRUST_PROXY_HOPS) || 1
app.set('trust proxy', trustProxyHops)

setupSwagger(app)

app.use(
  cors({
    origin: true,
    credentials: true,
    optionsSuccessStatus: 200,
  })
)
app.use(express.json({ limit: '10mb' }))

app.use('/api', api)

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[error]', err)
  res.status(500).json({ status: false, message: 'Internal server error' })
})

async function warmDatabaseConnection() {
  try {
    await sequelize.authenticate()
    console.log('Database connection ready')
  } catch (err) {
    console.error('[database] initial connection failed:', (err as Error)?.message)
  }
}

async function startApp() {
  await warmDatabaseConnection()
  const port = Number(process.env.PORT) || 4000

  app.listen(port, () => {
    console.log(`App started on port ${port}`)
  })
}

void startApp()
