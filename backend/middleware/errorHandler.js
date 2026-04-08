const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error(err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} already exists`;
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { message, statusCode: 401 };
  }

  // File upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'File too large';
    error = { message, statusCode: 400 };
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = 'Too many files uploaded';
    error = { message, statusCode: 400 };
  }

  // Stripe errors
  if (err.type === 'StripeCardError') {
    const message = err.message;
    error = { message, statusCode: 400 };
  }

  if (err.type === 'StripeRateLimitError') {
    const message = 'Too many requests to payment processor';
    error = { message, statusCode: 429 };
  }

  if (err.type === 'StripeInvalidRequestError') {
    const message = 'Invalid payment request';
    error = { message, statusCode: 400 };
  }

  if (err.type === 'StripeAPIError') {
    const message = 'Payment processor error';
    error = { message, statusCode: 500 };
  }

  if (err.type === 'StripeConnectionError') {
    const message = 'Payment processor connection error';
    error = { message, statusCode: 500 };
  }

  if (err.type === 'StripeAuthenticationError') {
    const message = 'Payment processor authentication error';
    error = { message, statusCode: 500 };
  }

  // Default error response
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
