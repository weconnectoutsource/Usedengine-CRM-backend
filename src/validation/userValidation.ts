import Joi from 'joi'

export const userCreateValidation = Joi.object({
  firstName: Joi.string().trim().required().messages({
    'any.required': 'First name is required',
    'string.empty': 'First name cannot be empty',
  }),
  lastName: Joi.string().trim().required().messages({
    'any.required': 'Last name is required',
    'string.empty': 'Last name cannot be empty',
  }),
  email: Joi.string().trim().email().required().messages({
    'any.required': 'Email is required',
    'string.email': 'Enter a valid email',
  }),
  phone: Joi.string().trim().allow(null, '').optional(),
}).meta({ className: 'UserCreateValidation' })

export const userUpdateValidation = Joi.object({
  firstName: Joi.string().trim().optional().messages({
    'string.empty': 'First name cannot be empty',
  }),
  lastName: Joi.string().trim().optional().messages({
    'string.empty': 'Last name cannot be empty',
  }),
  email: Joi.string().trim().email().optional().messages({
    'string.email': 'Enter a valid email',
  }),
  phone: Joi.string().trim().allow(null, '').optional(),
}).meta({ className: 'UserUpdateValidation' })

export const userParamsValidation = Joi.object({
  uuid: Joi.string().uuid().required().messages({
    'any.required': 'User uuid is required',
    'string.guid': 'User uuid must be a valid UUID',
  }),
}).meta({ className: 'UserParamsValidation' })

export const userListQueryValidation = Joi.object({
  search: Joi.string().trim().allow('').optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
}).meta({ className: 'UserListQueryValidation' })
