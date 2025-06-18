const express = require('express');
const router = express.Router();
const gameController = require('../controllers/games');
const { authenticate } = require('../middleware/auth');

// @route   POST /api/games
// @desc    Сохранение текущего состояния игры
// @access  Private
router.post('/', authenticate, gameController.saveGame);

// @route   GET /api/games
// @desc    Получение списка сохраненных игр пользователя
// @access  Private
router.get('/', authenticate, gameController.getGames);

// @route   DELETE /api/games/:id
// @desc    Удаление сохраненной игры
// @access  Private
router.delete('/:id', authenticate, gameController.deleteGame);

// @route   PUT /api/games/:id/rename
// @desc    Переименование сохраненной игры
// @access  Private
router.put('/:id/rename', authenticate, gameController.renameGame);

module.exports = router;