export function errorHandler(err, req, res, next) {
  console.error('[UNHANDLED SERVER ERROR]', err);
  const status = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    status: 'error',
    detail: message,
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
}
