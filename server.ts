import express from 'express';
import path from 'path';

const app = express();
const port = process.env.PORT || 3000;
const dir = typeof __dirname !== 'undefined' ? __dirname : process.cwd();

app.use(express.static(path.join(dir, 'dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(dir, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
