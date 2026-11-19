import dotenv from 'dotenv'
import { Sequelize } from 'sequelize'

dotenv.config()

const dbName = process.env.DBNAME as string
const dbUsername = process.env.DBUSERNAME as string
const dbPassword = process.env.DBPASSWORD as string
const dbHost = process.env.HOST as string
const dbPort = parseInt(process.env.DB_PORT || '5432', 10)

const useSSL = process.env.DB_SSL === 'true'
const dbPoolMax = parseInt(process.env.DB_POOL_MAX || '5', 10)
const dbPoolMin = parseInt(process.env.DB_POOL_MIN || '1', 10)
const dbPoolAcquire = parseInt(process.env.DB_POOL_ACQUIRE_MS || '30000', 10)
const dbPoolIdle = parseInt(process.env.DB_POOL_IDLE_MS || '30000', 10)

const transientConnectionErrors = [
  /Connection terminated unexpectedly/i,
  /Connection terminated/i,
  /ECONNRESET/i,
  /ETIMEDOUT/i,
  /SequelizeConnectionError/i,
]

const sequelize = new Sequelize(dbName, dbUsername, dbPassword, {
  host: dbHost,
  port: dbPort,
  dialect: 'postgres',
  logging: false,
  pool: {
    max: dbPoolMax,
    min: dbPoolMin,
    acquire: dbPoolAcquire,
    idle: dbPoolIdle,
    evict: 10000,
  },
  dialectOptions: {
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
    ...(useSSL && {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    }),
  },
  retry: {
    max: 2,
    match: transientConnectionErrors,
  },
})

export { sequelize }
