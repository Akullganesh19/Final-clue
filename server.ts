import express from 'express';

const app = express();

if (process.argv[1]?.includes('server.ts') || process.argv[1]?.includes('server.cjs')) {
  app.listen(3000, () => {
    console.log('Server running');
  });
}

export default app;
