import express from 'express';
const app = express();

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const isMainModule = process.argv[1]?.includes('server.ts') || process.argv[1]?.includes('server.cjs');

if (isMainModule) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default app;
