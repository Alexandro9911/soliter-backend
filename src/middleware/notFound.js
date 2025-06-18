/**
 * Middleware для обработки 404 ошибок
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const notFoundHandler = (req, res, next) => {
    res.status(404).json({
        success: false,
        error: `Not Found - ${req.method} ${req.originalUrl}`
    });
};

module.exports = notFoundHandler;