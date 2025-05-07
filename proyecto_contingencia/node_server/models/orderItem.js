const { DataTypes } = require('sequelize');

module.exports = (sequelizeInstance) => {
  const OrderItem = sequelizeInstance.define('OrderItem', {
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      // references set via association
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      // references set via association
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    price_at_purchase: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    }
  }, {
    tableName: 'order_items',
    timestamps: true
  });

  OrderItem.associate = (models) => {
    OrderItem.belongsTo(models.Order, {
      as: 'order',
      foreignKey: 'order_id',
      onDelete: 'CASCADE'
    });

    OrderItem.belongsTo(models.Product, {
      as: 'product',
      foreignKey: 'product_id',
      onDelete: 'SET NULL'
    });
  };

  return OrderItem;
};
