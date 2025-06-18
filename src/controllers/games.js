const { Pool } = require('pg');
const dbConfig = require('../config/db');
const pool = new Pool(dbConfig);

// Сохранение игры
const saveGame = async (req, res) => {
    try {
        const { name, gameData } = req.body;
        const userId = req.user.id;

        if (!name || !gameData) {
            return res.status(400).json({
                success: false,
                error: 'Name and game data are required'
            });
        }

        const result = await pool.query(
            `INSERT INTO saved_games (user_id, name, game_data) 
       VALUES ($1, $2, $3) 
       RETURNING id, name, game_data, created_at, updated_at`,
            [userId, name, gameData]
        );

        res.status(201).json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Save game error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to save game'
        });
    }
};

// Получение списка игр пользователя
const getGames = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await pool.query(
            `SELECT id, name, game_data, created_at, updated_at 
       FROM saved_games 
       WHERE user_id = $1 
       ORDER BY updated_at DESC`,
            [userId]
        );

        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {
        console.error('Get games error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get games'
        });
    }
};

// Удаление игры
const deleteGame = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const result = await pool.query(
            `DELETE FROM saved_games 
       WHERE id = $1 AND user_id = $2 
       RETURNING id`,
            [id, userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'Game not found or not owned by user'
            });
        }

        res.json({
            success: true,
            data: { id }
        });

    } catch (error) {
        console.error('Delete game error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete game'
        });
    }
};

// Переименование игры
const renameGame = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const userId = req.user.id;

        if (!name) {
            return res.status(400).json({
                success: false,
                error: 'New name is required'
            });
        }

        const result = await pool.query(
            `UPDATE saved_games 
       SET name = $1, updated_at = NOW() 
       WHERE id = $2 AND user_id = $3 
       RETURNING id, name, updated_at`,
            [name, id, userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'Game not found or not owned by user'
            });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Rename game error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to rename game'
        });
    }
};

module.exports = {
    saveGame,
    getGames,
    deleteGame,
    renameGame
};