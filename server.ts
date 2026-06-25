import express from 'express';

const app = express();
const port = 3000;

app.get('/api', (req, res) => {
  res.send('Hello World!');
});

if (process.argv[1]?.includes('server.ts') || process.argv[1]?.includes('server.cjs')) {
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}
