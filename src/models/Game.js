const { Pool } = require('pg');
const dbConfig = require('../config/db');
const pool = new Pool(dbConfig);

class Game {
    /**
     * Создание сохраненной игры
     * @param {number} userId
     * @param {string} name
     * @param {Object} gameData
     * @returns {Promise<Object>} Созданная игра
     */
    static async create(userId, name, gameData) {
        const result = await pool.query(
            `INSERT INTO saved_games (user_id, name, game_data) 
       VALUES ($1, $2, $3) 
       RETURNING id, name, game_data, created_at, updated_at`,
            [userId, name, gameData]
        );

        return result.rows[0];
    }

    /**
     * Получение игр пользователя
     * @param {number} userId
     * @returns {Promise<Array>} Массив игр
     */
    static async findByUser(userId) {
        const result = await pool.query(
            `SELECT id, name, game_data, created_at, updated_at 
       FROM saved_games 
       WHERE user_id = $1 
       ORDER BY updated_at DESC`,
            [userId]
        );

        return result.rows;
    }

    /**
     * Поиск игры по ID
     * @param {number} id
     * @param {number} userId
     * @returns {Promise<Object|null>} Найденная игра или null
     */
    static async findById(id, userId = null) {
        let query = 'SELECT * FROM saved_games WHERE id = $1';
        const params = [id];

        if (userId) {
            query += ' AND user_id = $2';
            params.push(userId);
        }

        const result = await pool.query(query, params);
        return result.rows[0] || null;
    }

    /**
     * Обновление игры
     * @param {number} id
     * @param {number} userId
     * @param {Object} updates
     * @returns {Promise<Object>} Обновленная игра
     */
    static async update(id, userId, updates) {
        const { name, gameData } = updates;
        const queryParams = [id, userId];
        let querySetParts = [];
        let paramCounter = 3;

        if (name) {
            querySetParts.push(`name = $${paramCounter}`);
            queryParams.push(name);
            paramCounter++;
        }

        if (gameData) {
            querySetParts.push(`game_data = $${paramCounter}`);
            queryParams.push(gameData);
            paramCounter++;
        }

        if (querySetParts.length === 0) {
            throw new Error('No fields to update');
        }

        const result = await pool.query(
            `UPDATE saved_games 
       SET ${querySetParts.join(', ')}, updated_at = NOW() 
       WHERE id = $1 AND user_id = $2 
       RETURNING id, name, game_data, created_at, updated_at`,
            queryParams
        );

        return result.rows[0];
    }

    /**
     * Удаление игры
     * @param {number} id
     * @param {number} userId
     * @returns {Promise<boolean>} Успешность операции
     */
    static async delete(id, userId) {
        const result = await pool.query(
            'DELETE FROM saved_games WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        return result.rowCount > 0;
    }
}

module.exports = Game;