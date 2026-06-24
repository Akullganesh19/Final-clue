import express from 'express';

const app = express();
const port = process.env.PORT || 3000;

app.get('/api', (req, res) => {
  res.send('API is running');
});

if (process.argv[1]?.includes('server.ts') || process.argv[1]?.includes('server.cjs')) {
  app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
  });
}

export default app;
