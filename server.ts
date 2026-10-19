import express from 'express';

const app = express();

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

export { app };

const isMain = process.argv[1]?.includes('server.ts') || process.argv[1]?.includes('server.cjs');

if (isMain) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}
