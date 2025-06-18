const { Pool } = require('pg');
const dbConfig = require('../config/db');
const pool = new Pool(dbConfig);
const bcrypt = require('bcryptjs');

// Обновление профиля пользователя
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { username, currentPassword, newPassword } = req.body;

        const userResult = await pool.query(
            'SELECT * FROM users WHERE id = $1',
            [userId]
        );
        const user = userResult.rows[0];

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        const updates = {};
        const queryParams = [userId];
        let querySetParts = [];
        let paramCounter = 2;

        if (username && username !== user.username) {
            // Проверка на уникальность нового username
            const existsResult = await pool.query(
                'SELECT id FROM users WHERE username = $1 AND id != $2',
                [username, userId]
            );

            if (existsResult.rows.length > 0) {
                return res.status(409).json({
                    success: false,
                    error: 'Username already taken'
                });
            }

            updates.username = username;
            querySetParts.push(`username = $${paramCounter}`);
            queryParams.push(username);
            paramCounter++;
        }

        // Обновление пароля
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({
                    success: false,
                    error: 'Current password is required to change password'
                });
            }

            const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    error: 'Current password is incorrect'
                });
            }

            const salt = await bcrypt.genSalt(10);
            const newPasswordHash = await bcrypt.hash(newPassword, salt);

            updates.password_hash = newPasswordHash;
            querySetParts.push(`password_hash = $${paramCounter}`);
            queryParams.push(newPasswordHash);
            paramCounter++;
        }

        // Если нет изменений
        if (querySetParts.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No changes provided'
            });
        }

        // Выполняем обновление
        const query = `
      UPDATE users 
      SET ${querySetParts.join(', ')} 
      WHERE id = $1 
      RETURNING id, username, created_at
    `;

        const result = await pool.query(query, queryParams);

        res.json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update profile'
        });
    }
};

// Удаление аккаунта
const deleteAccount = async (req, res) => {
    try {
        const userId = req.user.id;
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                success: false,
                error: 'Password is required to delete account'
            });
        }

        // Проверка пароля
        const userResult = await pool.query(
            'SELECT password_hash FROM users WHERE id = $1',
            [userId]
        );
        const user = userResult.rows[0];

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: 'Password is incorrect'
            });
        }

        await pool.query('DELETE FROM users WHERE id = $1', [userId]);

        res.json({
            success: true,
            data: { message: 'Account deleted successfully' }
        });

    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete account'
        });
    }
};

module.exports = {
    updateProfile,
    deleteAccount
};