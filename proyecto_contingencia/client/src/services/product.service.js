// src/services/productService.js
import AxiosRequest from '../utils/AxiosRequest'
import { mapMethod } from '../utils/MapMethod'

const RESOURCE = 'products'

const mapMethod = (method) => {
  switch (method) {
    case 'C': return 'POST'
    case 'R': return 'GET'
    case 'U': return 'PUT'
    case 'D': return 'DELETE'
    case 'P': return 'PATCH'
    default: throw new Error('Método no válido')
  }
}

/**
 * Crear un nuevo producto.
 * POST /products
 */
export const createProduct = (payload) => {
  return AxiosRequest(`${RESOURCE}`, mapMethod('C'), payload)
}

/**
 * Obtener todos los productos.
 * GET /products
 */
export const getAllProducts = () => {
  return AxiosRequest(`${RESOURCE}`, mapMethod('R'))
}

/**
 * Obtener un producto por ID.
 * GET /products/:id
 */
export const getProductById = (id) => {
  return AxiosRequest(`${RESOURCE}/${id}`, mapMethod('R'))
}

/**
 * Actualizar un producto.
 * PUT /products/:id
 */
export const updateProduct = (id, payload) => {
  return AxiosRequest(`${RESOURCE}/${id}`, mapMethod('U'), payload)
}

/**
 * Eliminar un producto.
 * DELETE /products/:id
 */
export const deleteProduct = (id) => {
  return AxiosRequest(`${RESOURCE}/${id}`, mapMethod('D'))
}
