import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

let currentDir = process.cwd();
try {
  const currentFilename = fileURLToPath(import.meta.url);
  currentDir = dirname(currentFilename);
} catch (e) {
  // Fallback for CJS
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(join(currentDir, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(join(currentDir, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
