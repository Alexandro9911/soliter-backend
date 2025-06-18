const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const dbConfig = require('../config/db');
const pool = new Pool(dbConfig);

/**
 * Генерация JWT токена
 * @param {Object} user - Объект пользователя
 * @param {number} user.id - ID пользователя
 * @param {string} user.username - Имя пользователя
 * @returns {string} JWT токен
 */
const generateToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            username: user.username
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN || '24h',
            issuer: 'solitaire-api'
        }
    );
};

/**
 * Верификация JWT токена
 * @param {string} token - JWT токен
 * @returns {Promise<Object>} Декодированные данные токена
 * @throws {Error} Если токен невалиден
 */
const verifyToken = async (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Проверяем, что пользователь существует
        const user = await pool.query(
            'SELECT id FROM users WHERE id = $1',
            [decoded.id]
        );

        if (!user.rows.length) {
            throw new Error('User not found');
        }

        return decoded;
    } catch (error) {
        console.error('JWT verification failed:', error.message);
        throw new Error('Invalid or expired token');
    }
};

/**
 * Получение пользователя из JWT токена
 * @param {string} token - JWT токен
 * @returns {Promise<Object|null>} Объект пользователя или null
 */
const getUserFromToken = async (token) => {
    try {
        const decoded = await verifyToken(token);
        const user = await pool.query(
            'SELECT id, username, created_at FROM users WHERE id = $1',
            [decoded.id]
        );
        return user.rows[0] || null;
    } catch (error) {
        return null;
    }
};

module.exports = {
    generateToken,
    verifyToken,
    getUserFromToken
};