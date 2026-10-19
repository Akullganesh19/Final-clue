import express from 'express';
import path from 'path';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(process.cwd(), 'dist')));

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});