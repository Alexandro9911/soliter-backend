const { Pool } = require('pg');
const dbConfig = require('../config/db');
const pool = new Pool(dbConfig);
const bcrypt = require('bcryptjs');

class User {
    /**
     * Создание нового пользователя
     * @param {string} username
     * @param {string} password
     * @returns {Promise<Object>} Созданный пользователь
     */
    static async create(username, password) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const result = await pool.query(
            `INSERT INTO users (username, password_hash) 
       VALUES ($1, $2) 
       RETURNING id, username, created_at`,
            [username, hashedPassword]
        );

        return result.rows[0];
    }

    /**
     * Поиск пользователя по username
     * @param {string} username
     * @returns {Promise<Object|null>} Найденный пользователь или null
     */
    static async findByUsername(username) {
        const result = await pool.query(
            'SELECT * FROM users WHERE username = $1',
            [username]
        );

        return result.rows[0] || null;
    }

    /**
     * Поиск пользователя по ID
     * @param {number} id
     * @returns {Promise<Object|null>} Найденный пользователь или null
     */
    static async findById(id) {
        const result = await pool.query(
            'SELECT id, username, created_at FROM users WHERE id = $1',
            [id]
        );

        return result.rows[0] || null;
    }

    /**
     * Проверка пароля
     * @param {string} candidatePassword
     * @param {string} hashedPassword
     * @returns {Promise<boolean>} Совпадает ли пароль
     */
    static async comparePassword(candidatePassword, hashedPassword) {
        return await bcrypt.compare(candidatePassword, hashedPassword);
    }

    /**
     * Обновление данных пользователя
     * @param {number} id
     * @param {Object} updates
     * @returns {Promise<Object>} Обновленный пользователь
     */
    static async update(id, updates) {
        const { username, password } = updates;
        const queryParams = [id];
        let querySetParts = [];
        let paramCounter = 2;

        if (username) {
            querySetParts.push(`username = $${paramCounter}`);
            queryParams.push(username);
            paramCounter++;
        }

        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            querySetParts.push(`password_hash = $${paramCounter}`);
            queryParams.push(hashedPassword);
            paramCounter++;
        }

        if (querySetParts.length === 0) {
            throw new Error('No fields to update');
        }

        const result = await pool.query(
            `UPDATE users 
       SET ${querySetParts.join(', ')}, updated_at = NOW() 
       WHERE id = $1 
       RETURNING id, username, created_at`,
            queryParams
        );

        return result.rows[0];
    }

    /**
     * Удаление пользователя
     * @param {number} id
     * @returns {Promise<boolean>} Успешность операции
     */
    static async delete(id) {
        const result = await pool.query(
            'DELETE FROM users WHERE id = $1',
            [id]
        );

        return result.rowCount > 0;
    }
}

module.exports = User;