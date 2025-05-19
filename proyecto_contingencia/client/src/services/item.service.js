// src/services/itemService.js
import AxiosRequest from '../utils/AxiosRequest'
import { mapMethod } from '../utils/MapMethod'

const RESOURCE = 'items'
const HEALTH = 'db-host'

/**
 * Obtener el host de base de datos actual.
 * GET /db-host
 */
export const getCurrentDbHost = () => {
  return AxiosRequest(`${HEALTH}`, mapMethod('R'))
}

/**
 * Crear un nuevo ítem.
 * POST /items
 */
export const createItem = (payload) => {
  return AxiosRequest(`${RESOURCE}`, mapMethod('C'), payload)
}

/**
 * Obtener todos los ítems.
 * GET /items
 */
export const getAllItems = () => {
  return AxiosRequest(`${RESOURCE}`, mapMethod('R'))
}

/**
 * Obtener un ítem por su ID.
 * GET /items/:id
 */
export const getItemById = (id) => {
  return AxiosRequest(`${RESOURCE}/${id}`, mapMethod('R'))
}

/**
 * Actualizar un ítem.
 * PUT /items/:id
 */
export const updateItem = (id, payload) => {
  return AxiosRequest(`${RESOURCE}/${id}`, mapMethod('U'), payload)
}

/**
 * Eliminar un ítem.
 * DELETE /items/:id
 */
export const deleteItem = (id) => {
  return AxiosRequest(`${RESOURCE}/${id}`, mapMethod('D'))
}
