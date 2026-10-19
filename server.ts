import express from 'express';

const app = express();
const port = process.env.PORT || 3000;

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Using a simpler approach to check if this is the main module
const isMain = process.argv[1]?.includes('server.ts');
if (isMain) {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

export default app;
