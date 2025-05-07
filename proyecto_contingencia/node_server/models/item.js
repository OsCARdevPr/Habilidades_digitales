const { DataTypes } = require('sequelize');
const { currentSequelize } = require('../config/database'); // Use getter to ensure it gets the current instance

const Item = () => currentSequelize.define('Item', {
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'items',
  // timestamps: true, // Sequelize handles createdAt and updatedAt by default if columns exist
});

module.exports = Item;
