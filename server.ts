import express from 'express';
import path from 'path';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Serve static files from the dist directory
app.use(express.static(path.join(process.cwd(), 'dist')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Final Clue API' });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
