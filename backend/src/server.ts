import app from './app';

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.warn(`Server running on http://localhost:${PORT}`);
  console.warn(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.warn('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.warn('HTTP server closed');
  });
});

process.on('SIGINT', () => {
  console.warn('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.warn('HTTP server closed');
    process.exit(0);
  });
});

export default server;
