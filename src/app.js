require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Импорт роутов
const authRoutes = require('./routes/auth.routes');
const gameRoutes = require('./routes/game.routes');

// Импорт middleware
const { errorHandler, notFound } = require('./middleware/error');

const app = express();

// Настройка CORS
const corsOptions = {
    origin: 'https://127.0.0.1:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan('dev'));

// Лимитер запросов
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});
app.use(limiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});

// Роуты
app.use('/api/auth', authRoutes);
app.use('/api/games', gameRoutes);

// Обработка 404
app.use(notFound);

// Обработка ошибок
app.use(errorHandler);

module.exports = app;