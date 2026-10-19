import express from 'express';

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Final Clue API Server');
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
