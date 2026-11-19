require('dotenv').config();

const useSSL = process.env.DB_SSL === 'true';

const shared = {
  username: process.env.DBUSERNAME,
  password: process.env.DBPASSWORD,
  database: process.env.DBNAME,
  host: process.env.HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  dialect: 'postgres',
  logging: false,
  pool: {
    max: parseInt(process.env.DB_POOL_MAX || '5', 10),
    min: parseInt(process.env.DB_POOL_MIN || '1', 10),
    acquire: parseInt(process.env.DB_POOL_ACQUIRE_MS || '30000', 10),
    idle: parseInt(process.env.DB_POOL_IDLE_MS || '30000', 10),
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
};

module.exports = {
  development: shared,
  test: shared,
  staging: shared,
  production: shared,
};
