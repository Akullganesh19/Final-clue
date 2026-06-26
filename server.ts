import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

if (process.argv[1]?.includes('server.ts') || process.argv[1]?.includes('server.cjs')) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
