import express from 'express';
import path from 'path';

const app = express();
const port = process.env.PORT || 3000;

// Directory resolution relies on process.cwd() rather than import.meta.url
const distPath = path.join(process.cwd(), 'dist');

app.use(express.static(distPath));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Final Clue API' });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
