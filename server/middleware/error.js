export function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
}

export function errorHandler(err, _req, res, _next) {
  let status = err.status || 500;
  let message = err.message || 'Something went wrong.';

  if (err.name === 'CastError') { status = 404; message = 'Not found.'; }
  if (err.name === 'ValidationError') { status = 400; message = Object.values(err.errors).map((e) => e.message).join(', '); }
  if (err.code === 11000) { status = 409; message = 'That email is already registered.'; }

  if (status === 500) console.error(err);
  res.status(status).json({ message: status === 500 && process.env.NODE_ENV === 'production' ? 'Server error.' : message });
}
