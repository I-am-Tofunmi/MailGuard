const path = require('path');
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const isProduction = process.env.NODE_ENV === 'production';
const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);
const isHostedDb = hasDatabaseUrl && !process.env.DATABASE_URL.includes('localhost') && !process.env.DATABASE_URL.includes('127.0.0.1');

const poolConfig = {
  connectionString: process.env.DATABASE_URL,
};

if (isProduction || isHostedDb) {
  poolConfig.ssl = { rejectUnauthorized: false };
}

const pool = new Pool(poolConfig);

pool.on('connect', () => {
  console.log('Database pool: client connected successfully');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle database client:', err.message || err);
});

const query = (text, params) => {
  return pool.query(text, params);
};

const db = {
  pool,
  query,
};

module.exports = {
  pool,
  query,
  db,
};
