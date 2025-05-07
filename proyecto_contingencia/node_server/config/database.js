const { Sequelize } = require('sequelize');

const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_HOST_MASTER = process.env.DB_HOST_MASTER;
const DB_HOST_SLAVE = process.env.DB_HOST_SLAVE;
const DB_PORT = process.env.DB_PORT || 3306;

const sequelizeMaster = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST_MASTER,
  port: DB_PORT,
  dialect: 'mysql',
  logging: console.log,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

const sequelizeSlave = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST_SLAVE,
  port: DB_PORT,
  dialect: 'mysql',
  logging: console.log,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  // Important for read replicas
  replication: {
    read: [{ host: DB_HOST_SLAVE, user: DB_USER, password: DB_PASSWORD }],
    write: { host: DB_HOST_MASTER, user: DB_USER, password: DB_PASSWORD }
  }
});

// Default to master, slave will be used by proxy logic
let currentSequelize = sequelizeMaster;
let currentDbHost = DB_HOST_MASTER;

const switchToMaster = () => {
  console.log('Switching to MASTER DB');
  currentSequelize = sequelizeMaster;
  currentDbHost = DB_HOST_MASTER;
};

const switchToSlave = () => {
  console.log('Switching to SLAVE DB');
  currentSequelize = sequelizeSlave;
  currentDbHost = DB_HOST_SLAVE;
};

const testConnection = async (sequelizeInstance, host) => {
  try {
    await sequelizeInstance.authenticate();
    console.log(`Connection to ${host} has been established successfully.`);
    return true;
  } catch (error) {
    console.error(`Unable to connect to the database at ${host}:`, error.message);
    return false;
  }
};

module.exports = {
  sequelizeMaster,
  sequelizeSlave,
  get currentSequelize() { return currentSequelize; },
  get currentDbHost() { return currentDbHost; },
  switchToMaster,
  switchToSlave,
  testConnection
};
