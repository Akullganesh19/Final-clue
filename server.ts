import express from 'express';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Conditionally start the server
const isMainModule = process.argv[1]?.includes('server.ts') || process.argv[1]?.includes('server.cjs');

if (isMainModule) {
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

export default app;
