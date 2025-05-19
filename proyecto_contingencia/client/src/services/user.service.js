// src/services/userService.js
import AxiosRequest from '../utils/AxiosRequest'
import { mapMethod } from '../utils/MapMethod'

const RESOURCE = 'users';

// --- Auth & User routes ---

/**
 * Registra un nuevo usuario.
 * POST /users/register
 * @param {{ username: string, email: string, password: string, first_name?: string, last_name?: string, address?: string }} payload
 */
export const registerUser = (payload) => {
  return AxiosRequest(`${RESOURCE}/register`, mapMethod('C'), payload)
}

/**
 * Login de usuario.
 * POST /users/login
 * @param {{ email: string, password: string }} payload
 */
export const loginUser = (payload) => {
  return AxiosRequest(`${RESOURCE}/login`, mapMethod('C'), payload)
}

/**
 * Obtiene todos los usuarios.
 * GET /users
 */
export const getAllUsers = () => {
  return AxiosRequest(`${RESOURCE}`, mapMethod('R'))
}

/**
 * Obtiene un usuario por ID.
 * GET /users/:id
 * @param {string} id
 */
export const getUserById = (id) => {
  return AxiosRequest(`${RESOURCE}/${id}`, mapMethod('R'))
}

/**
 * Actualiza un usuario.
 * PUT /users/:id
 * @param {string} id
 * @param {{ username?: string, email?: string, first_name?: string, last_name?: string, address?: string, password?: string }} payload
 */
export const updateUserById = (id, payload) => {
  return AxiosRequest(`${RESOURCE}/${id}`, mapMethod('U'), payload)
}

/**
 * Elimina un usuario.
 * DELETE /users/:id
 * @param {string} id
 */
export const deleteUserById = (id) => {
  return AxiosRequest(`${RESOURCE}/${id}`, mapMethod('D'))
}

/**
 * Obtiene todas las órdenes de un usuario.
 * GET /users/:id/orders
 * @param {string} id
 */
export const getUserOrders = (id) => {
  return AxiosRequest(`${RESOURCE}/${id}/orders`, mapMethod('R'))
}
