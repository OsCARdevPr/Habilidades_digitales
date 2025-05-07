const { DataTypes } = require('sequelize');

module.exports = (sequelizeInstance) => {
  const Product = sequelizeInstance.define('Product', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    stock_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      // references will be set via associations
    },
    image_url: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'products',
  });

  Product.associate = (models) => {
    Product.belongsTo(models.Category, {
      as: 'category',
      foreignKey: 'category_id',
      onDelete: 'SET NULL'
    });

    Product.hasMany(models.OrderItem, {
      as: 'orderItems',
      foreignKey: 'product_id',
      onDelete: 'SET NULL'
    });

    // Products belong to many Orders through OrderItem
    Product.belongsToMany(models.Order, {
      through: models.OrderItem,
      as: 'orders',
      foreignKey: 'product_id',
      otherKey: 'order_id'
    });
  };

  return Product;
};
