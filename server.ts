import express from 'express';

const app = express();
const port = process.env.PORT || 3000;

app.get('/api', (req, res) => {
  res.json({ message: 'Hello from Final Clue API' });
});

// Avoid hanging during tests
if (process.argv[1]?.includes('server.ts') || process.argv[1]?.includes('server.cjs')) {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

export default app;
