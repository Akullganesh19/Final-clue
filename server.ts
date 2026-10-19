import express from 'express';

const app = express();

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

if (process.argv[1]?.includes('server.ts')) {
  app.listen(3000, () => {
    console.log('Server running on port 3000');
  });
}

export default app;
