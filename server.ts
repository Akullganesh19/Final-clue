import express from 'express';
import path from 'path';

const app = express();
const port = process.env.PORT || 3000;

// Use process.cwd() for resolving the static directory
app.use(express.static(path.join(process.cwd(), 'dist/client')));

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
