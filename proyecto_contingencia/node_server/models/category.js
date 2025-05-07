const { DataTypes } = require('sequelize');

module.exports = (sequelizeInstance) => {
  const Category = sequelizeInstance.define('Category', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'categories',
  });

  Category.associate = (models) => {
    Category.hasMany(models.Product, {
      as: 'products',
      foreignKey: 'category_id',
      onDelete: 'SET NULL'
    });
  };

  return Category;
};
