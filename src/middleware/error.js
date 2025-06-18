
const notFound = (req, res, next) => {
    res.status(404).json({
        success: false,
        error: `Not Found - ${req.originalUrl}`
    });
};

const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message;

    // Специальная обработка для некоторых типов ошибок
    if (err.name === 'CastError') {
        statusCode = 400;
        message = 'Invalid resource ID';
    } else if (err.code === '23505') { // Ошибка уникальности PostgreSQL
        statusCode = 409;
        message = 'Duplicate key violation';
    } else if (err.name === 'ValidationError') {
        statusCode = 400;
        message = Object.values(err.errors).map(val => val.message).join(', ');
    }

    res.status(statusCode).json({
        success: false,
        error: message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};

module.exports = {
    notFound,
    errorHandler
};