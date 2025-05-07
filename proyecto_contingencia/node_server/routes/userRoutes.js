const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../models'); // Importar el objeto db centralizado

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_very_secure_secret_key_that_is_at_least_32_chars_long';

// Middleware ya no es necesario, los modelos se acceden via db.User, db.Order, etc.

// --- User Registration ---
router.post('/users/register', async (req, res) => {
  try {
    const { username, email, password, first_name, last_name, address } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required.' });
    }
    const user = await db.User.create({ username, email, password, first_name, last_name, address });
    res.status(201).json(user); // user ya no tiene password_hash por el defaultScope
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'User with this username or email already exists.' });
    }
    console.error("Registration error:", error);
    res.status(400).json({ error: error.message });
  }
});

// --- User Login ---
router.post('/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await db.User.scope('withPasswordHash').findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials: User not found.' });
    }

    const isMatch = await user.validPassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials: Password incorrect.' });
    }

    const payload = {
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    };

    jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: '1h' }, 
      (err, token) => {
        if (err) throw err;
        const userResponse = { ...user.toJSON() };
        delete userResponse.password_hash;
        delete userResponse.password; 

        res.json({
          token,
          user: userResponse
        });
      }
    );

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// Get all users (Admin functionality)
router.get('/users', async (req, res) => {
  try {
    const users = await db.User.findAll();
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get a single user by ID
router.get('/users/:id', async (req, res) => {
  try {
    const user = await db.User.findByPk(req.params.id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error(`Error fetching user ${req.params.id}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// Update a user
router.put('/users/:id', async (req, res) => {
  try {
    const user = await db.User.findByPk(req.params.id);
    if (user) {
      const { username, email, first_name, last_name, address, password } = req.body;
      let updateData = { username, email, first_name, last_name, address };
      if (password) { 
        updateData.password = password; // El setter en el modelo User se encargará del hash
      }
      await user.update(updateData);
      const userResponse = { ...user.toJSON() };
      delete userResponse.password_hash; // Asegurarse de que no se devuelva el hash
      delete userResponse.password; // Y tampoco el password en texto plano si se pasó
      res.json(userResponse);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'Update failed: Username or email already in use by another account.' });
    }
    console.error(`Error updating user ${req.params.id}:`, error);
    res.status(400).json({ error: error.message });
  }
});

// Delete a user (Admin functionality)
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await db.User.findByPk(req.params.id);
    if (user) {
      await user.destroy();
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error(`Error deleting user ${req.params.id}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// Get all orders for a specific user
router.get('/users/:id/orders', async (req, res) => {
    try {
        const user = await db.User.findByPk(req.params.id, {
            include: [{
                model: db.Order, // Usar db.Order
                as: 'orders',
                include: [ 
                  { 
                    model: db.OrderItem, // Usar db.OrderItem
                    as: 'orderItems',
                    include: [{ model: db.Product, as: 'product', attributes: ['id', 'name', 'price']}] // Usar db.Product
                  }
                ]
            }]
        });
        if (user) {
            res.json(user.orders || []); // Devolver un array vacío si no hay ordenes
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error("Error fetching user orders:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
