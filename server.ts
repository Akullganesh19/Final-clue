import express from 'express';
const app = express();

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

if (process.argv[1]?.includes('server.ts')) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
