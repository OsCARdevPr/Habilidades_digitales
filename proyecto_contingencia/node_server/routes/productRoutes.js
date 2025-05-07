const express = require('express');
const db = require('../models'); // Importar el objeto db centralizado

const router = express.Router();

// --- Product CRUD Operations ---

// Create a new product
router.post('/products', async (req, res, next) => { // Ensure next is present
  try {
    const { name, description, price, stock_quantity, category_id, image_url } = req.body;
    if (!name || price === undefined || stock_quantity === undefined) {
      const err = new Error('Product name, price, and stock quantity are required.');
      err.status = 400;
      return next(err);
    }
    if (category_id) {
        const category = await db.Category.findByPk(category_id);
        if (!category) {
            const err = new Error(`Category with id ${category_id} not found.`);
            err.status = 400;
            return next(err);
        }
    }
    const product = await db.Product.create({ name, description, price, stock_quantity, category_id, image_url });
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    if (!error.status) {
        error.status = 400; // Default for creation/bad input
    }
    next(error);
  }
});

// Get all products (potentially with category info)
router.get('/products', async (req, res, next) => {
  if (!db || typeof db !== 'object') {
    console.error('Critical Error in GET /products: The db object from models/index.js is not available or not an object.');
    const err = new Error('Critical Server Configuration Error: Database models are not loaded correctly.');
    err.status = 500;
    return next(err);
  }

  try {
    const findOptions = {};
    if (db.Category) {
      findOptions.include = [{
        model: db.Category,
        as: 'category',
        attributes: ['id', 'name']
      }];
    } else {
      console.warn('Warning in GET /products: db.Category model not found. Fetching products without category information.');
    }

    if (!db.Product) {
      console.error('Error in GET /products: db.Product model not found within the db object.');
      const err = new Error('Server Configuration Error: Product model is not available.');
      err.status = 500;
      return next(err);
    }

    const products = await db.Product.findAll(findOptions);
    res.json(products);
  } catch (error) {
    console.error('Error in GET /products route execution:', error);
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
});

// Get a single product by ID (with category info)
router.get('/products/:id', async (req, res, next) => { // Ensure next is present
  try {
    const product = await db.Product.findByPk(req.params.id, {
      include: [{
        model: db.Category,
        as: 'category',
        attributes: ['id', 'name']
      }]
    });
    if (product) {
      res.json(product);
    } else {
      const err = new Error('Product not found');
      err.status = 404;
      next(err);
    }
  } catch (error) {
    console.error(`Error fetching product ${req.params.id}:`, error);
    if (!error.status) {
        error.status = 500;
    }
    next(error);
  }
});

// Update a product
router.put('/products/:id', async (req, res, next) => { // Ensure next is present
  try {
    const product = await db.Product.findByPk(req.params.id);
    if (product) {
      const { name, description, price, stock_quantity, category_id, image_url } = req.body;
      if (category_id && category_id !== product.category_id) {
        const category = await db.Category.findByPk(category_id);
        if (!category) {
            const err = new Error(`Category with id ${category_id} not found.`);
            err.status = 400;
            return next(err);
        }
      }
      await product.update({ name, description, price, stock_quantity, category_id, image_url });
      res.json(product);
    } else {
      const err = new Error('Product not found');
      err.status = 404;
      next(err);
    }
  } catch (error) {
    console.error(`Error updating product ${req.params.id}:`, error);
    if (!error.status) {
        error.status = 400; // Default for update/bad input
    }
    next(error);
  }
});

// Delete a product
router.delete('/products/:id', async (req, res, next) => { // Ensure next is present
  try {
    const product = await db.Product.findByPk(req.params.id);
    if (product) {
      await product.destroy();
      res.status(204).send();
    } else {
      const err = new Error('Product not found');
      err.status = 404;
      next(err);
    }
  } catch (error) {
    console.error(`Error deleting product ${req.params.id}:`, error);
    if (!error.status) {
        error.status = 500;
    }
    next(error);
  }
});

module.exports = router;