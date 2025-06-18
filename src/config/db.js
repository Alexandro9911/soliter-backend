require('dotenv').config();

const dbConfig = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    ssl: process.env.DB_SSL === 'true' ? {
        rejectUnauthorized: false,
    } : false
};

// Проверка обязательных параметров
if (!process.env.DB_NAME) {
    console.warn('Warning: DB_NAME not set in .env, using default');
}

module.exports = dbConfig;

module.exports.testConnection = async () => {
    const { Pool } = require('pg');
    const testPool = new Pool(dbConfig);

    try {
        const client = await testPool.connect();
        console.log('Database connection successful');
        client.release();
        return true;
    } catch (err) {
        console.error('Database connection error:', err.message);
        return false;
    } finally {
        await testPool.end();
    }
};