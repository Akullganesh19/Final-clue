import express from 'express';

export const app = express();
const port = process.env.PORT || 3000;

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.get('/api/data', (req, res) => {
  // Simulate slow endpoint to demonstrate caching and coalescing
  setTimeout(() => {
    res.json({
      message: 'Hello from the backend!',
      timestamp: Date.now()
    });
  }, 500);
});

if (process.argv[1]?.includes('server.ts')) {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}
