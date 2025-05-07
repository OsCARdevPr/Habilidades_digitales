const { DataTypes } = require('sequelize');

module.exports = (sequelizeInstance) => { // Renamed to avoid conflict
  const Order = sequelizeInstance.define('Order', {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      // references will be set via associations
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'pending'
    },
    order_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    shipping_address: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'orders',
  });

  Order.associate = (models) => {
    // Belongs to User
    Order.belongsTo(models.User, {
      as: 'user',
      foreignKey: 'user_id',
      onDelete: 'CASCADE'
    });

    // Has many OrderItems
    Order.hasMany(models.OrderItem, {
      as: 'orderItems',
      foreignKey: 'order_id',
      onDelete: 'CASCADE'
    });

    // Belongs to many Products through OrderItem
    Order.belongsToMany(models.Product, {
      through: models.OrderItem, // Use the OrderItem model from the central loader
      as: 'products',
      foreignKey: 'order_id',
      otherKey: 'product_id'
    });
  };

  return Order;
};
