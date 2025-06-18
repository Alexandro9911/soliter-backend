const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const { authenticate } = require('../middleware/auth');


// @route   POST /api/auth/register
// @desc    Регистрация нового пользователя
// @access  Public
router.post('/register', authController.register);

// @route   POST /api/auth/login
// @desc    Аутентификация пользователя
// @access  Public
router.post('/login', authController.login);

// @route   GET /api/auth/me
// @desc    Получение данных текущего пользователя
// @access  Private
router.get('/me', authenticate, authController.getMe);

module.exports = router;