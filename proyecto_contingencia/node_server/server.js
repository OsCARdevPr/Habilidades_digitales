const express = require('express');
const cors = require('cors'); // Importar cors
const { sequelizeMaster, sequelizeSlave, testConnection, switchToMaster, switchToSlave, currentDbHost, currentSequelize } = require('./config/database');
const db = require('./models'); // Import the central models loader
const itemRoutes = require('./routes/itemRoutes');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

const corsOptions = {
  origin: function (origin, callback) {
    // Permitir solicitudes sin origen (como aplicaciones móviles o solicitudes curl)
    if (!origin) return callback(null, true);
    // Definir los orígenes permitidos
    const allowedOrigins = ['http://localhost:8080', 'http://localhost:3001']; // Puerto del proxy Nginx y puerto común de desarrollo del frontend. Ajusta el puerto 3001 si es necesario.
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'La política CORS para este sitio no permite el acceso desde el Origen especificado.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Content-Type,Authorization,X-Requested-With,Accept,Origin", // Cabeceras comunes y Authorization
  credentials: true, // Permitir el envío de cookies
  optionsSuccessStatus: 204 // Para solicitudes preflight OPTIONS
};
app.use(cors(corsOptions));

app.use(express.json());

// Health check and DB status endpoint
app.get('/health', async (req, res) => {
  const masterOnline = await testConnection(sequelizeMaster, process.env.DB_HOST_MASTER);
  const slaveOnline = await testConnection(sequelizeSlave, process.env.DB_HOST_SLAVE);
  res.json({
    server_status: 'online',
    database_connections: {
      master: masterOnline ? 'online' : 'offline',
      slave: slaveOnline ? 'online' : 'offline',
      currently_using: currentDbHost
    }
  });
});

// Endpoint to manually switch to slave (for testing, or if proxy detects master down)
app.post('/switch-to-slave', (req, res) => {
  switchToSlave();
  res.send('Switched to slave DB. All new requests will use slave.');
});

// Endpoint to manually switch back to master
app.post('/switch-to-master', (req, res) => {
  switchToMaster();
  res.send('Switched to master DB. All new requests will use master.');
});

// Item routes
app.use('/api', itemRoutes);
// New E-commerce routes
app.use('/api', userRoutes);
app.use('/api', categoryRoutes);
app.use('/api', productRoutes);
app.use('/api', orderRoutes);

// Global error handler
app.use((err, req, res, next) => {
  // Log detailed error information to the console
  console.error('[GLOBAL ERROR HANDLER CAUGHT]');
  console.error('Timestamp:', new Date().toISOString());
  console.error('Request Path:', req.path);
  console.error('Request Method:', req.method);
  console.error('Error Object:', err); // Log the full error object
  if (err instanceof Error) {
    console.error('Error Name:', err.name);
    console.error('Error Message:', err.message);
    console.error('Error Stack:', err.stack);
  } else {
    console.error('Error was not an Error instance. Type:', typeof err);
  }
  console.error('Were headers already sent?', res.headersSent);

  if (req.path && req.path.startsWith('/api/')) {
    if (!res.headersSent) {
      const statusCode = err.status || 500;
      const message = err.message || 'An unexpected API error occurred.';
      res.status(statusCode).json({
        message: message,
        errorDetails: err.message, // Or provide a more generic detail for production
        errorType: err.name || 'UnknownError',
        // Stack trace should ideally only be sent in development
        stack: process.env.NODE_ENV === 'development' && err.stack ? err.stack : undefined
      });
    } else {
      console.error('API Error: Headers were already sent. Cannot send JSON response. Delegating to default Express handler.');
      // If headers are sent, Express's default error handler will take over.
      // It might be the one sending "Something broke!" as HTML.
      // We call next(err) to ensure it does, if it hasn't already been triggered.
      // However, if headers are sent, calling next(err) might not change the outcome if the response is already committed.
      // The key is that we've logged the error above.
      if (next && typeof next === 'function') { // Ensure next is a function before calling
        next(err); 
      }
    }
  } else {
    // For non-API routes
    if (!res.headersSent) {
      res.status(err.status || 500).send(err.message || 'Something broke on a non-API route!');
    } else {
      console.error('Non-API Error: Headers were already sent. Delegating to default Express handler.');
      if (next && typeof next === 'function') {
        next(err);
      }
    }
  }
});

const startServer = async () => {
  try {
    // Test initial connections
    const masterReady = await testConnection(sequelizeMaster, process.env.DB_HOST_MASTER);
    const slaveReady = await testConnection(sequelizeSlave, process.env.DB_HOST_SLAVE);

    // Models are already initialized and associated by requiring('./models')
    // So, direct calls to require model files and initialize them are no longer needed here.

    let activeSequelizeInstance;

    if (masterReady) {
      switchToMaster(); 
      activeSequelizeInstance = sequelizeMaster; // Use master instance for sync
      console.log('All models were synchronized successfully (Master DB).');
    } else if (slaveReady) {
      console.warn('Master DB is offline, attempting to start with Slave DB.');
      switchToSlave();
      activeSequelizeInstance = sequelizeSlave; // Use slave instance (less common to sync with slave)
      console.log('Connected to Slave DB. Models ready (read-only perspective).');
    } else {
      console.error('Both Master and Slave DBs are offline. Application cannot start properly.');
      // process.exit(1); // Optionally exit if no DB is available
      // Fallback to master sequelize instance for attempting sync, though it will likely fail
      activeSequelizeInstance = sequelizeMaster;
    }
    
    // Sync all models using the determined active Sequelize instance
    // Ensure db.sequelize is correctly pointing to the sequelize instance used by models
    // The models/index.js should set db.sequelize = currentSequelize from database.js
    if (activeSequelizeInstance && db.sequelize) { // Check if db.sequelize is set
      await activeSequelizeInstance.sync({ alter: true });
      console.log('All models were synchronized successfully with the active DB (', currentDbHost, ').');
    } else if (activeSequelizeInstance) {
      // Fallback if db.sequelize was not set by models/index.js for some reason
      // This case should ideally not be reached if models/index.js is correct
      await activeSequelizeInstance.sync({ alter: true });
      console.log('All models were synchronized successfully with activeSequelizeInstance (', currentDbHost, ').');
    } else {
      console.error('No active database instance available for model synchronization.');
    }

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Currently connected to database: ${currentDbHost}`);
    });
  } catch (error) {
    console.error('Failed to start the server:', error);
    process.exit(1);
  }
};

startServer();
