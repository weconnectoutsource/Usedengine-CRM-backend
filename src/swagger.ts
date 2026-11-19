import swaggerJSDoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import { Express } from 'express'
import { buildPathsFromRegisteredRoutes } from './routes/registerRoute'
import { buildJoiSwaggerSchemas } from './validation/swaggerComponents'

type OpenApiSpec = {
  paths?: Record<string, unknown>
  [key: string]: unknown
}

export const isSwaggerEnabled = (): boolean => {
  if (process.env.ENABLE_SWAGGER === 'false') return false
  if (process.env.ENABLE_SWAGGER === 'true') return true
  return process.env.NODE_ENV !== 'production'
}

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Usedengine CRM API Docs',
      version: '1.0.0',
      description: 'API documentation for Usedengine CRM.',
    },
    servers: [
      {
        url: '/api',
        description: 'Current environment',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: buildJoiSwaggerSchemas(),
    },
  },
  apis: [],
}

export const setupSwagger = (app: Express): void => {
  if (!isSwaggerEnabled()) {
    return
  }

  const swaggerSpec = swaggerJSDoc(options) as OpenApiSpec
  const registeredPaths = buildPathsFromRegisteredRoutes()
  const mergedSpec = {
    ...swaggerSpec,
    paths: {
      ...(swaggerSpec.paths ?? {}),
      ...registeredPaths,
    },
  }

  const port = process.env.PORT || '4000'
  app.get('/api/api-docs.json', (_req, res) => {
    res.setHeader('Cache-Control', 'no-store')
    res.json(mergedSpec)
  })
  app.use(
    '/api/api-docs',
    ...(Array.isArray(swaggerUi.serve) ? swaggerUi.serve : [swaggerUi.serve]),
    swaggerUi.setup(mergedSpec)
  )
  console.log(`Swagger docs available at http://localhost:${port}/api/api-docs`)
}
