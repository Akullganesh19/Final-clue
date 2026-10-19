import express from 'express';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

// Directory resolution in server.ts relies on process.cwd() rather than import.meta.url
const staticDir = path.join(process.cwd(), 'dist');
app.use(express.static(staticDir));

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
