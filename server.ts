import express from 'express';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Environment setup requires a Gemini API key
if (!process.env.GEMINI_API_KEY) {
  console.warn('WARNING: GEMINI_API_KEY is not set in the environment variables.');
}

app.use(express.json());

// Serve static assets from Vite build
// Directory resolution relies on process.cwd() rather than import.meta.url for CJS compatibility
app.use(express.static(path.join(process.cwd(), 'dist')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Final Clue System API' });
});

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
