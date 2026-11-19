import express from 'express'
import { createUser, deleteUser, getUser, listUsers, updateUser } from '../controllers/userController'
import {
  userCreateValidation,
  userListQueryValidation,
  userParamsValidation,
  userUpdateValidation,
} from '../validation/userValidation'
import { registerRoute } from './registerRoute'

const userRouter = express.Router()

registerRoute(userRouter, {
  method: 'get',
  path: '/',
  swaggerPath: '/users',
  handler: listUsers,
  schema: { query: userListQueryValidation },
  summary: 'List users',
  tags: ['Users'],
  responses: { 200: { description: 'Users fetched' } },
})

registerRoute(userRouter, {
  method: 'post',
  path: '/',
  swaggerPath: '/users',
  handler: createUser,
  schema: { body: userCreateValidation },
  summary: 'Create a user',
  tags: ['Users'],
  responses: {
    201: { description: 'User created' },
    409: { description: 'Email is already in use' },
  },
})

registerRoute(userRouter, {
  method: 'get',
  path: '/:uuid',
  swaggerPath: '/users/:uuid',
  handler: getUser,
  schema: { params: userParamsValidation },
  summary: 'Get a user',
  tags: ['Users'],
  responses: {
    200: { description: 'User fetched' },
    404: { description: 'User not found' },
  },
})

registerRoute(userRouter, {
  method: 'patch',
  path: '/:uuid',
  swaggerPath: '/users/:uuid',
  handler: updateUser,
  schema: { params: userParamsValidation, body: userUpdateValidation },
  summary: 'Update a user',
  tags: ['Users'],
  responses: {
    200: { description: 'User updated' },
    404: { description: 'User not found' },
    409: { description: 'Email is already in use' },
  },
})

registerRoute(userRouter, {
  method: 'delete',
  path: '/:uuid',
  swaggerPath: '/users/:uuid',
  handler: deleteUser,
  schema: { params: userParamsValidation },
  summary: 'Delete a user',
  tags: ['Users'],
  responses: {
    200: { description: 'User deleted' },
    404: { description: 'User not found' },
  },
})

export { userRouter }
