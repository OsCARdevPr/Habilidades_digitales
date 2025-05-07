// filepath: c:\Users\oscar\OneDrive\Desktop\proyecto de habilidades digitales\proyecto_contingencia\node_server\models\index.js
const fs = require('fs');
const path = require('path');
const { currentSequelize } = require('../config/database'); // Import the currentSequelize instance

const db = {};
const basename = path.basename(__filename);

// Read all files in the current directory, filter out non-JS files and the index file itself
fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    // For each model file, require it and initialize it with the currentSequelize instance
    const modelDefiner = require(path.join(__dirname, file));
    const model = modelDefiner(currentSequelize); // Initialize model with sequelize
    db[model.name] = model;
  });

// Call the associate method for each model, if it exists
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db); // Pass all models to the associate method
  }
});

db.sequelize = currentSequelize; // Add the sequelize instance to the db object
// db.Sequelize = Sequelize; // Optionally add the Sequelize library itself

module.exports = db; // Export all initialized and associated models