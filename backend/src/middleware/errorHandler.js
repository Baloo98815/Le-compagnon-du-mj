const logger = require('../utils/logger');

/**
 * Middleware de gestion des erreurs globales
 */
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Erreur interne du serveur';

  logger.error(`[${req.method}] ${req.path} - ${message}`, {
    statusCode,
    stack: err.stack,
    body: req.body,
    params: req.params,
    query: req.query,
  });

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

/**
 * Middleware pour les routes non trouvées
 */
function notFound(req, res, next) {
  const error = new Error(`Route non trouvée : ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

/**
 * Wrapper async pour éviter les try/catch répétitifs
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = { errorHandler, notFound, asyncHandler };
