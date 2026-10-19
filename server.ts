import express from 'express';

const app = express();
const port = 3000;

app.get('/api', (req, res) => {
  res.send('Hello from API');
});

// Avoid hanging during tests
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

export default app;
