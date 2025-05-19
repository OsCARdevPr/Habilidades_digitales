// src/services/orderService.js
import AxiosRequest from '../utils/AxiosRequest'
import { mapMethod } from '../utils/MapMethod'

const RESOURCE = 'orders'

/**
 * Crea una nueva orden.
 * POST /orders
 */
export const createOrder = (payload) => {
  return AxiosRequest(`${RESOURCE}`, mapMethod('C'), payload)
}

/**
 * Obtiene todas las órdenes.
 * GET /orders
 */
export const getAllOrders = () => {
  return AxiosRequest(`${RESOURCE}`, mapMethod('R'))
}

/**
 * Obtiene una orden por su ID.
 * GET /orders/:id
 */
export const getOrderById = (id) => {
  return AxiosRequest(`${RESOURCE}/${id}`, mapMethod('R'))
}

/**
 * Actualiza el estado de una orden.
 * PUT /orders/:id/status
 */
export const updateOrderStatus = (id, payload) => {
  return AxiosRequest(`${RESOURCE}/${id}/status`, mapMethod('U'), payload)
}

/**
 * Elimina una orden.
 * DELETE /orders/:id
 */
export const deleteOrder = (id) => {
  return AxiosRequest(`${RESOURCE}/${id}`, mapMethod('D'))
}
