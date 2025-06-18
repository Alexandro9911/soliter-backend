const { body, validationResult } = require('express-validator');
const { Pool } = require('pg');
const dbConfig = require('../config/db');
const pool = new Pool(dbConfig);

/**
 * Валидация данных регистрации
 */
const validateRegister = [
    body('username')
        .trim()
        .notEmpty().withMessage('Username is required')
        .isLength({ min: 3, max: 20 }).withMessage('Username must be between 3-20 characters')
        .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers and underscores')
        .custom(async (username) => {
            const user = await pool.query(
                'SELECT id FROM users WHERE username = $1',
                [username]
            );
            if (user.rows.length) {
                throw new Error('Username already in use');
            }
        }),

    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
        .matches(/\d/).withMessage('Password must contain a number')
        .matches(/[a-zA-Z]/).withMessage('Password must contain a letter'),
];

/**
 * Валидация данных входа
 */
const validateLogin = [
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required')
];

/**
 * Валидация сохранения игры
 */
const validateSaveGame = [
    body('name')
        .trim()
        .notEmpty().withMessage('Game name is required')
        .isLength({ max: 100 }).withMessage('Game name too long'),

    body('gameData')
        .notEmpty().withMessage('Game data is required')
        .custom((data) => {
            try {
                if (typeof data !== 'object') {
                    return false;
                }
                return true;
            } catch {
                return false;
            }
        }).withMessage('Invalid game data format')
];

/**
 * Валидация переименования игры
 */
const validateRenameGame = [
    body('name')
        .trim()
        .notEmpty().withMessage('New name is required')
        .isLength({ max: 100 }).withMessage('Game name too long')
];

/**
 * Обработка результатов валидации
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array().map(err => ({
                field: err.param,
                message: err.msg
            }))
        });
    }
    next();
};

module.exports = {
    validateRegister,
    validateLogin,
    validateSaveGame,
    validateRenameGame,
    handleValidationErrors
};