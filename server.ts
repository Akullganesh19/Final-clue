import express from 'express';

const app = express();
const port = process.env.PORT || 3000;

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

export const server = app;

if (process.argv[1]?.includes('server.ts') || process.argv[1]?.includes('server.cjs')) {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}
