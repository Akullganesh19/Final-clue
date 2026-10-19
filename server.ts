import express from 'express';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Conditionally start the server to avoid hanging during tests
if (process.argv[1]?.includes('server.ts') || process.argv[1]?.includes('server.cjs')) {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

export default app;
