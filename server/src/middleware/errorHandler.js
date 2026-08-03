export function notFound(req, res) {
  res.status(404).json({ message: 'Route not found' });
}

export function errorHandler(err, req, res, next) {
  console.error(err);
  const isDbError = err.name === 'MongoServerSelectionError' || err.name === 'MongooseServerSelectionError';
  const status = err.status || (isDbError ? 503 : 500);
  const message = isDbError ? 'Database temporarily unavailable, please try again' : err.message || 'Internal server error';
  res.status(status).json({ message });
}
