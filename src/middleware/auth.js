const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const dbConfig = require('../config/db');
const pool = new Pool(dbConfig);

const authenticate = async (req, res, next) => {
    try {
        // Получаем токен из заголовка Authorization
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'Authentication token required'
            });
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const userResult = await pool.query(
            'SELECT id, username FROM users WHERE id = $1',
            [decoded.id]
        );

        if (userResult.rows.length === 0) {
            return res.status(401).json({
                success: false,
                error: 'User not found'
            });
        }

        req.user = userResult.rows[0];
        next();

    } catch (error) {
        console.error('Authentication error:', error.message);

        let errorMessage = 'Invalid or expired token';
        if (error.name === 'JsonWebTokenError') {
            errorMessage = 'Invalid token';
        } else if (error.name === 'TokenExpiredError') {
            errorMessage = 'Token expired';
        }

        res.status(401).json({
            success: false,
            error: errorMessage
        });
    }
};

const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: 'Unauthorized access'
            });
        }
        next();
    };
};

module.exports = {
    authenticate,
    authorizeRoles
};