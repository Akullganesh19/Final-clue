import express from 'express';
import path from 'path';

const app = express();
const port = process.env.PORT || 3000;

const publicDir = path.join(process.cwd(), 'dist');
app.use(express.static(publicDir));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Final Clue API is running' });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
