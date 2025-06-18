require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Импорт роутов
const mainRoutes = require('./routes/index'); // Главный роутер со всеми подроутами
const authRoutes = require('./routes/auth.routes');
const gameRoutes = require('./routes/game.routes');

// Импорт middleware
const { errorHandler, notFound } = require('./middleware/error');

const app = express();

// Лимитер запросов
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 минут
    max: 100 // лимит запросов
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(limiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'API is working',
        timestamp: new Date().toISOString()
    });
});

// Подключение роутов
app.use('/api', mainRoutes); // Основные роуты
app.use('/api/auth', authRoutes);
app.use('/api/games', gameRoutes);

// Обработка 404 (должен быть после всех роутов)
app.use(notFound);

// Обработка ошибок (должен быть последним)
app.use(errorHandler);

module.exports = app;