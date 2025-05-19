// src/services/categoryService.js
import AxiosRequest from '../utils/AxiosRequest'
import { mapMethod } from '../utils/MapMethod'

const RESOURCE = 'categories'

/**
 * Crea una nueva categoría.
 * POST /categories
 */
export const createCategory = (payload) => {
  return AxiosRequest(`${RESOURCE}`, mapMethod('C'), payload)
}

/**
 * Obtiene todas las categorías.
 * GET /categories
 */
export const getAllCategories = () => {
  return AxiosRequest(`${RESOURCE}`, mapMethod('R'))
}

/**
 * Obtiene una categoría por su ID.
 * GET /categories/:id
 */
export const getCategoryById = (id) => {
  return AxiosRequest(`${RESOURCE}/${id}`, mapMethod('R'))
}

/**
 * Obtiene todos los productos de una categoría específica.
 * GET /categories/:id/products
 */
export const getProductsByCategory = (id) => {
  return AxiosRequest(`${RESOURCE}/${id}/products`, mapMethod('R'))
}

/**
 * Actualiza una categoría.
 * PUT /categories/:id
 */
export const updateCategory = (id, payload) => {
  return AxiosRequest(`${RESOURCE}/${id}`, mapMethod('U'), payload)
}

/**
 * Elimina una categoría.
 * DELETE /categories/:id
 */
export const deleteCategory = (id) => {
  return AxiosRequest(`${RESOURCE}/${id}`, mapMethod('D'))
}
