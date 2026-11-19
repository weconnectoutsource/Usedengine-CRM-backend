import type { Schema } from 'joi'
import j2s from 'joi-to-swagger'
import {
  userCreateValidation,
  userListQueryValidation,
  userParamsValidation,
  userUpdateValidation,
} from './userValidation'

const validationSchemas: Schema[] = [
  userCreateValidation,
  userUpdateValidation,
  userParamsValidation,
  userListQueryValidation,
]

export const buildJoiSwaggerSchemas = (): Record<string, unknown> => {
  const schemas: Record<string, unknown> = {}
  let components: Record<string, Record<string, unknown>> = {}

  for (const schema of validationSchemas) {
    const result = j2s(schema, components)
    if (result.components?.schemas) {
      Object.assign(schemas, result.components.schemas)
      components = {
        ...components,
        schemas: {
          ...components.schemas,
          ...result.components.schemas,
        },
      }
    }
  }

  return schemas
}
