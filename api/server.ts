/**
 * local server entry file, for local development
 */
import app from './app.js';

/**
 * start server with port
 */
const PORT = process.env.PORT || 3001;

const startServer = (port: number) => {
  const server = app.listen(port, () => {
    console.log(`Server ready on port ${port}`);
  });

  server.on('error', (e: NodeJS.ErrnoException) => {
    if (e.code === 'EADDRINUSE') {
      console.log(`Port ${port} is busy, trying ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error(e);
    }
  });

  /**
   * close server
   */
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('SIGINT signal received');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
};

startServer(Number(PORT));

export default app;
