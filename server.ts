import express from 'express';
import path from 'path';

const app = express();
const port = process.env.PORT || 3000;

// Use process.cwd() instead of __dirname / import.meta.url for esbuild compatibility
const staticPath = path.join(process.cwd(), 'dist/client');

app.use(express.static(staticPath));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Fallback to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(staticPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
