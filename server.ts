import express from 'express';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// For ES Modules / CJS compatibility in build:
// we use process.cwd() to resolve the dist directory reliably
const distPath = path.join(process.cwd(), 'dist');
app.use(express.static(distPath));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', agents: ['Sentinel', 'Medic', 'Architect', 'Scribe', 'Warden', 'Herald', 'Oracle'] });
});

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
