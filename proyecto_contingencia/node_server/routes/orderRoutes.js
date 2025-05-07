const express = require('express');
const { currentSequelize } = require('../config/database'); // To manage transactions
const OrderModel = require('../models/order');
const OrderItemModel = require('../models/orderItem');
const ProductModel = require('../models/product');
const UserModel = require('../models/user');

const router = express.Router();

// Middleware to get models with the current Sequelize instance
router.use((req, res, next) => {
  req.Order = OrderModel();
  req.OrderItem = OrderItemModel();
  req.Product = ProductModel();
  req.User = UserModel();
  next();
});

// --- Order CRUD Operations ---

// Create a new order
router.post('/orders', async (req, res) => {
  const transaction = await currentSequelize.transaction();
  try {
    const { user_id, shipping_address, items } = req.body; // items: [{ product_id, quantity }, ...]

    if (!user_id || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'User ID and at least one item are required.' });
    }

    // Verify user exists
    const user = await req.User.findByPk(user_id, { transaction });
    if (!user) {
        await transaction.rollback();
        return res.status(404).json({ error: `User with id ${user_id} not found.` });
    }

    let totalAmount = 0;
    const orderItemsDetails = [];

    for (const item of items) {
      const product = await req.Product.findByPk(item.product_id, { transaction });
      if (!product) {
        await transaction.rollback();
        return res.status(404).json({ error: `Product with id ${item.product_id} not found.` });
      }
      if (product.stock_quantity < item.quantity) {
        await transaction.rollback();
        return res.status(400).json({ error: `Not enough stock for product ${product.name}. Available: ${product.stock_quantity}, Requested: ${item.quantity}` });
      }

      totalAmount += product.price * item.quantity;
      orderItemsDetails.push({
        product_id: product.id,
        quantity: item.quantity,
        price_at_purchase: product.price
      });

      // Decrease stock
      product.stock_quantity -= item.quantity;
      await product.save({ transaction });
    }

    const order = await req.Order.create({
      user_id,
      total_amount: totalAmount,
      shipping_address,
      status: 'pending' // Default status
    }, { transaction });

    // Create order items
    const createdOrderItems = await req.OrderItem.bulkCreate(
      orderItemsDetails.map(detail => ({ ...detail, order_id: order.id })),
      { transaction }
    );

    await transaction.commit();
    
    // Fetch the created order with its items to return in the response
    const finalOrder = await req.Order.findByPk(order.id, {
        include: [
            { model: req.User, as: 'user', attributes: ['id', 'username', 'email'] },
            { 
                model: req.OrderItem, 
                as: 'orderItems',
                include: [{ model: req.Product, as: 'product', attributes: ['id', 'name']}]
            }
        ]
    });

    res.status(201).json(finalOrder);

  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: `Failed to create order: ${error.message}` });
  }
});

// Get all orders (Admin functionality, with user and item details)
router.get('/orders', async (req, res) => {
  try {
    const orders = await req.Order.findAll({
      include: [
        { model: req.User, as: 'user', attributes: ['id', 'username', 'email'] },
        { 
          model: req.OrderItem, 
          as: 'orderItems',
          include: [{ model: req.Product, as: 'product', attributes: ['id', 'name', 'price']}]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single order by ID
router.get('/orders/:id', async (req, res) => {
  try {
    const order = await req.Order.findByPk(req.params.id, {
      include: [
        { model: req.User, as: 'user', attributes: ['id', 'username', 'email'] },
        { 
          model: req.OrderItem, 
          as: 'orderItems',
          include: [{ model: req.Product, as: 'product', attributes: ['id', 'name', 'price']}]
        }
      ]
    });
    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ error: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update an order's status (e.g., to 'paid', 'shipped', 'delivered')
router.put('/orders/:id/status', async (req, res) => {
  try {
    const order = await req.Order.findByPk(req.params.id);
    if (order) {
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ error: 'Status is required.' });
      }
      // Add validation for allowed status values if necessary
      // e.g. const allowedStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];
      // if (!allowedStatuses.includes(status)) { ... }

      order.status = status;
      await order.save();
      res.json(order);
    } else {
      res.status(404).json({ error: 'Order not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete an order (Admin functionality - carefully consider implications, e.g., stock adjustment)
// Deleting an order might require complex logic like returning stock, which is not implemented here.
router.delete('/orders/:id', async (req, res) => {
  const transaction = await currentSequelize.transaction();
  try {
    const order = await req.Order.findByPk(req.params.id, { include: ['orderItems'], transaction });
    if (order) {
      // Optional: Logic to return stock for items in a cancelled/deleted order
      // for (const item of order.orderItems) {
      //   const product = await req.Product.findByPk(item.product_id, { transaction });
      //   if (product) {
      //     product.stock_quantity += item.quantity;
      //     await product.save({ transaction });
      //   }
      // }
      await order.destroy({ transaction }); // This will also delete associated orderItems due to onDelete: CASCADE
      await transaction.commit();
      res.status(204).send();
    } else {
      await transaction.rollback();
      res.status(404).json({ error: 'Order not found' });
    }
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
