import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Avoid require.main === module, use process.argv check instead as per memory
if (process.argv[1]?.includes('server.ts') || process.argv[1]?.includes('server.cjs')) {
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

export default app;
