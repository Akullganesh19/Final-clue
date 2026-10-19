import express from 'express';

const app = express();

app.get('/api', (req, res) => {
  res.json({ message: 'Hello World' });
});

if (process.argv[1]?.includes('server.ts') || process.argv[1]?.includes('server.cjs')) {
  app.listen(3000, () => console.log('Server running on port 3000'));
}
