import type { RequestHandler, Router } from 'express'
import type { Schema } from 'joi'
import j2s from 'joi-to-swagger'
import { validateRequest } from '../middleware/validate'

type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete'

export interface RouteSchema {
  body?: Schema
  params?: Schema
  query?: Schema
}

export interface SwaggerParameter {
  name: string
  in: 'path' | 'query' | 'header'
  required?: boolean
  schema?: Record<string, unknown>
  description?: string
}

export interface RegisterRouteOptions {
  method: HttpMethod
  path: string
  swaggerPath: string
  handler: RequestHandler
  middlewares?: RequestHandler[]
  schema?: RouteSchema
  summary?: string
  description?: string
  tags?: string[]
  security?: boolean
  parameters?: SwaggerParameter[]
  requestBody?: Record<string, unknown>
  bodyContentType?: string
  responses?: Record<string, unknown>
}

export interface RegisteredRoute {
  swaggerPath: string
  method: HttpMethod
  operation: Record<string, unknown>
}

const registeredRoutes: RegisteredRoute[] = []

export const getRegisteredRoutes = (): RegisteredRoute[] => registeredRoutes

const toOpenApiPath = (path: string): string => path.replace(/:([a-zA-Z0-9_]+)/g, '{$1}')

const inferPathParameters = (expressPath: string): SwaggerParameter[] =>
  [...expressPath.matchAll(/:([a-zA-Z0-9_]+)/g)].map((match) => ({
    name: match[1],
    in: 'path',
    required: true,
    schema: { type: 'string' },
  }))

const joiToSwaggerSchema = (schema: Schema): Record<string, unknown> => j2s(schema).swagger

const schemaToParameters = (schema: Schema, location: 'path' | 'query'): SwaggerParameter[] => {
  const { swagger } = j2s(schema)
  const properties = (swagger.properties ?? {}) as Record<string, Record<string, unknown>>
  const required = (swagger.required ?? []) as string[]

  return Object.keys(properties).map((name) => ({
    name,
    in: location,
    required: required.includes(name),
    schema: properties[name],
    description: typeof properties[name]?.description === 'string' ? properties[name].description : undefined,
  }))
}

const buildRequestBodyFromSchema = (schema: Schema, contentType: string): Record<string, unknown> => ({
  required: true,
  content: {
    [contentType]: {
      schema: joiToSwaggerSchema(schema),
    },
  },
})

const mergeParameters = (parameters: SwaggerParameter[]): SwaggerParameter[] => {
  const byKey = new Map<string, SwaggerParameter>()
  for (const parameter of parameters) {
    byKey.set(`${parameter.in}:${parameter.name}`, parameter)
  }
  return [...byKey.values()]
}

export const jsonBodyRef = (className: string): Record<string, unknown> => ({
  required: true,
  content: {
    'application/json': {
      schema: { $ref: `#/components/schemas/${className}` },
    },
  },
})

export const oneOfJsonBody = (classNames: string[], description?: string): Record<string, unknown> => ({
  required: true,
  content: {
    'application/json': {
      schema: {
        ...(description ? { description } : {}),
        oneOf: classNames.map((name) => ({ $ref: `#/components/schemas/${name}` })),
      },
    },
  },
})

export const registerRoute = (router: Router, options: RegisterRouteOptions): void => {
  const {
    method,
    path,
    swaggerPath,
    handler,
    middlewares = [],
    schema,
    summary,
    description,
    tags = [],
    security = false,
    parameters: extraParameters = [],
    requestBody: requestBodyOverride,
    bodyContentType = 'application/json',
    responses = { 200: { description: 'Success' } },
  } = options

  const validation = schema ? [validateRequest(schema)] : []
  router[method](path, ...middlewares, ...validation, handler)

  const parameters = mergeParameters([
    ...inferPathParameters(path),
    ...extraParameters,
    ...(schema?.params ? schemaToParameters(schema.params, 'path') : []),
    ...(schema?.query ? schemaToParameters(schema.query, 'query') : []),
  ])

  let requestBody: Record<string, unknown> | undefined
  if (requestBodyOverride) {
    requestBody = requestBodyOverride
  } else if (schema?.body) {
    requestBody = buildRequestBodyFromSchema(schema.body, bodyContentType)
  }

  const operation: Record<string, unknown> = {
    ...(summary ? { summary } : {}),
    ...(description ? { description } : {}),
    ...(tags.length > 0 ? { tags } : {}),
    ...(security ? { security: [{ bearerAuth: [] }] } : {}),
    ...(parameters.length > 0 ? { parameters } : {}),
    ...(requestBody ? { requestBody } : {}),
    responses,
  }

  registeredRoutes.push({
    swaggerPath: toOpenApiPath(swaggerPath),
    method,
    operation,
  })
}

export const buildPathsFromRegisteredRoutes = (): Record<string, Record<string, unknown>> => {
  const paths: Record<string, Record<string, unknown>> = {}

  for (const route of registeredRoutes) {
    if (!paths[route.swaggerPath]) {
      paths[route.swaggerPath] = {}
    }
    paths[route.swaggerPath][route.method] = route.operation
  }

  return paths
}
