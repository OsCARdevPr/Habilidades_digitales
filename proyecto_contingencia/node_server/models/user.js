const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelizeInstance) => { // Renamed to avoid conflict with require('sequelize')
  const User = sequelizeInstance.define('User', {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      set(value) {
        if (value && value.length > 0) { // Added check for empty value
          const salt = bcrypt.genSaltSync(10);
          this.setDataValue('password_hash', bcrypt.hashSync(value, salt));
        }
      }
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'users',
    defaultScope: {
      attributes: { exclude: ['password_hash', 'password'] },
    },
    scopes: {
      withPasswordHash: {
        attributes: { include: ['password_hash'] },
      }
    }
  });

  User.prototype.validPassword = async function(password) {
    // Ensure password_hash is available on the instance
    // If using defaultScope, it might be excluded. Consider fetching with withPasswordHash scope.
    if (!this.password_hash) {
        // This might happen if the instance was fetched without the password_hash
        // You might need to reload the instance with the correct scope or handle this case
        throw new Error('User instance does not have password_hash. Fetch with scope \'withPasswordHash\'.');
    }
    return await bcrypt.compare(password, this.password_hash);
  };

  User.associate = (models) => {
    User.hasMany(models.Order, { // models.Order will be passed by the central loader
      as: 'orders',
      foreignKey: 'user_id',
      onDelete: 'CASCADE'
    });
  };

  return User;
};
