const express = require('express');
const db = require('../models'); // Importar el objeto db centralizado

const router = express.Router();

// Middleware ya no es necesario, los modelos se acceden via db.Category y db.Product

// --- Category CRUD Operations ---

// Create a new category
router.post('/categories', async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Category name is required.' });
    }
    const category = await db.Category.create({ name, description });
    res.status(201).json(category);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'Category with this name already exists.' });
    }
    console.error("Error creating category:", error);
    res.status(400).json({ error: error.message });
  }
});

// Get all categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await db.Category.findAll();
    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get a single category by ID
router.get('/categories/:id', async (req, res) => {
  try {
    const category = await db.Category.findByPk(req.params.id);
    if (category) {
      res.json(category);
    } else {
      res.status(404).json({ error: 'Category not found' });
    }
  } catch (error) {
    console.error(`Error fetching category ${req.params.id}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// Get all products for a specific category
router.get('/categories/:id/products', async (req, res) => {
    try {
        const category = await db.Category.findByPk(req.params.id, {
            include: [{
                model: db.Product, // Usar db.Product
                as: 'products'
            }]
        });
        if (category) {
            res.json(category.products || []); // Devolver array vacío si no hay productos
        } else {
            res.status(404).json({ error: 'Category not found' });
        }
    } catch (error) {
        console.error(`Error fetching products for category ${req.params.id}:`, error);
        res.status(500).json({ error: error.message });
    }
});

// Update a category
router.put('/categories/:id', async (req, res) => {
  try {
    const category = await db.Category.findByPk(req.params.id);
    if (category) {
      const { name, description } = req.body;
      await category.update({ name, description });
      res.json(category);
    } else {
      res.status(404).json({ error: 'Category not found' });
    }
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'Update failed: Category name already in use.' });
    }
    console.error(`Error updating category ${req.params.id}:`, error);
    res.status(400).json({ error: error.message });
  }
});

// Delete a category
router.delete('/categories/:id', async (req, res) => {
  try {
    const category = await db.Category.findByPk(req.params.id);
    if (category) {
      await category.destroy();
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Category not found' });
    }
  } catch (error) {
    console.error(`Error deleting category ${req.params.id}:`, error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
