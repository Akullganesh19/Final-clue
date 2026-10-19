import express from 'express';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

// Resolve directory properly for esbuild
const rootDir = process.cwd();

app.use(express.json());

// Serve static files from the dist directory (assuming Vite builds there)
app.use(express.static(path.join(rootDir, 'dist')));

// API Routes
app.get('/api/status', (req, res) => {
  res.json({ status: 'online', agents: ['Sentinel', 'Medic', 'Architect', 'Scribe', 'Warden', 'Herald', 'Oracle'] });
});

// Fallback to index.html for React Router
app.get('*', (req, res) => {
  res.sendFile(path.join(rootDir, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Final Clue server listening on port ${PORT}`);
});
