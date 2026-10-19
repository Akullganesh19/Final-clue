import express from 'express';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const currentDir = process.cwd();

app.use(express.json());

// Serve static files from the dist directory (Vite build output)
app.use(express.static(path.join(currentDir, 'dist')));

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(currentDir, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
