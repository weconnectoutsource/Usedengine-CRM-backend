import type { RequestHandler } from 'express'
import type { Schema } from 'joi'
import type { RouteSchema } from '../routes/registerRoute'

const validatePart = (schema: Schema, value: unknown) =>
  schema.validate(value, { abortEarly: false, stripUnknown: true, convert: true })

export const validateRequest = (schema: RouteSchema): RequestHandler => {
  return (req, res, next) => {
    if (schema.params) {
      const { error, value } = validatePart(schema.params, req.params)
      if (error) {
        res.status(400).json({
          status: false,
          message: error.details.map((detail) => detail.message).join(', '),
        })
        return
      }
      req.params = value
    }

    if (schema.query) {
      const { error, value } = validatePart(schema.query, req.query)
      if (error) {
        res.status(400).json({
          status: false,
          message: error.details.map((detail) => detail.message).join(', '),
        })
        return
      }
      req.query = value
    }

    if (schema.body) {
      const { error, value } = validatePart(schema.body, req.body)
      if (error) {
        res.status(400).json({
          status: false,
          message: error.details.map((detail) => detail.message).join(', '),
        })
        return
      }
      req.body = value
    }

    next()
  }
}
