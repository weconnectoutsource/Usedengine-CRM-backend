import { Request, Response } from 'express'
import { Op, UniqueConstraintError } from 'sequelize'
import { User } from '../models'

const toPublicUser = (user: User) => ({
  uuid: user.uuid,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  phone: user.phone,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
})

export const listUsers = async (req: Request, res: Response): Promise<void> => {
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 20
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : ''
  const offset = (page - 1) * limit

  const where = search
    ? {
        [Op.or]: [
          { firstName: { [Op.iLike]: `%${search}%` } },
          { lastName: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
        ],
      }
    : undefined

  const { rows, count } = await User.findAndCountAll({
    where,
    limit,
    offset,
    order: [['createdAt', 'DESC']],
  })

  res.status(200).json({
    status: true,
    message: 'Users fetched',
    data: rows.map(toPublicUser),
    meta: { page, limit, total: count },
  })
}

export const getUser = async (req: Request, res: Response): Promise<void> => {
  const user = await User.findOne({ where: { uuid: req.params.uuid } })
  if (!user) {
    res.status(404).json({ status: false, message: 'User not found' })
    return
  }

  res.status(200).json({ status: true, message: 'User fetched', data: toPublicUser(user) })
}

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone || null,
    })

    res.status(201).json({ status: true, message: 'User created', data: toPublicUser(user) })
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      res.status(409).json({ status: false, message: 'Email is already in use' })
      return
    }
    throw error
  }
}

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  const user = await User.findOne({ where: { uuid: req.params.uuid } })
  if (!user) {
    res.status(404).json({ status: false, message: 'User not found' })
    return
  }

  try {
    await user.update({
      firstName: req.body.firstName ?? user.firstName,
      lastName: req.body.lastName ?? user.lastName,
      email: req.body.email ?? user.email,
      phone: req.body.phone === undefined ? user.phone : req.body.phone || null,
    })

    res.status(200).json({ status: true, message: 'User updated', data: toPublicUser(user) })
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      res.status(409).json({ status: false, message: 'Email is already in use' })
      return
    }
    throw error
  }
}

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  const deleted = await User.destroy({ where: { uuid: req.params.uuid } })
  if (!deleted) {
    res.status(404).json({ status: false, message: 'User not found' })
    return
  }

  res.status(200).json({ status: true, message: 'User deleted' })
}
