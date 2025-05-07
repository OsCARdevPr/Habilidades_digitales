const express = require('express');
const ItemModel = require('../models/item');
const { currentSequelize, currentDbHost } = require('../config/database');

const router = express.Router();

// Middleware to get the Item model with the current Sequelize instance
router.use((req, res, next) => {
  req.Item = ItemModel(); // Initialize model with the potentially switched Sequelize instance
  next();
});

// Get current DB host (for demonstration)
router.get('/db-host', (req, res) => {
    res.json({ current_database_host: currentDbHost });
});

// CRUD operations
// Create
router.post('/items', async (req, res) => {
  try {
    const item = await req.Item.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Read all
router.get('/items', async (req, res) => {
  try {
    const items = await req.Item.findAll();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Read one
router.get('/items/:id', async (req, res) => {
  try {
    const item = await req.Item.findByPk(req.params.id);
    if (item) {
      res.json(item);
    } else {
      res.status(404).json({ error: 'Item not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update
router.put('/items/:id', async (req, res) => {
  try {
    const item = await req.Item.findByPk(req.params.id);
    if (item) {
      await item.update(req.body);
      res.json(item);
    } else {
      res.status(404).json({ error: 'Item not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete
router.delete('/items/:id', async (req, res) => {
  try {
    const item = await req.Item.findByPk(req.params.id);
    if (item) {
      await item.destroy();
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Item not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
