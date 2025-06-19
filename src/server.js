const app = require('./app');
const http = require('http');
const { Pool } = require('pg');
const dbConfig = require('./config/db');

const PORT = process.env.PORT || 3001;

const pool = new Pool(dbConfig);

// Проверка подключения к БД
pool.connect()
    .then(() => {
        console.log('Successfully connected to PostgreSQL database');

        const server = http.createServer(app);

        server.on('error', (error) => {
            if (error.syscall !== 'listen') {
                throw error;
            }

            switch (error.code) {
                case 'EACCES':
                    console.error(`Port ${PORT} requires elevated privileges`);
                    process.exit(1);
                case 'EADDRINUSE':
                    console.error(`Port ${PORT} is already in use`);
                    process.exit(1);
                default:
                    throw error;
            }
        });

        process.on('SIGTERM', () => shutdown(server, pool));
        process.on('SIGINT', () => shutdown(server, pool));

        server.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('Database connection error:', err.stack);
        process.exit(1);
    });

function shutdown(server, pool) {
    console.log('Shutting down gracefully...');
    server.close(() => {
        pool.end()
            .then(() => {
                console.log('Server and database pool closed');
                process.exit(0);
            })
            .catch(err => {
                console.error('Error closing database pool:', err);
                process.exit(1);
            });
    });
}

module.exports = pool;