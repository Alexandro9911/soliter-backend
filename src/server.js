const app = require('./app');
const https = require('https');
const fs = require('fs');
const { Pool } = require('pg');
const dbConfig = require('./config/db');

const PORT = process.env.PORT || 443;

const pool = new Pool(dbConfig);

pool.connect((err, client, done) => {
    if (err) {
        console.error('Error connecting to PostgreSQL:', err.stack);
        process.exit(1);
    } else {
        console.log('Successfully connected to PostgreSQL database');
        done();
    }
});

const httpsOptions = {
    key: fs.readFileSync('./certs/server.key'),
    cert: fs.readFileSync('./certs/server.crt')
};

const server = https.createServer(httpsOptions, app);

server.on('error', (error) => {
    if (error.syscall !== 'listen') {
        throw error;
    }

    switch (error.code) {
        case 'EACCES':
            console.error(`Port ${PORT} requires elevated privileges`);
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(`Port ${PORT} is already in use`);
            process.exit(1);
            break;
        default:
            throw error;
    }
});

process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully');
    server.close(() => {
        pool.end();
        console.log('Server closed. Database connection pool ended');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully');
    server.close(() => {
        pool.end();
        console.log('Server closed. Database connection pool ended');
        process.exit(0);
    });
});

server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`Server listening on https://localhost:${PORT}`);
});

module.exports = server;