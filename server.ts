import express from 'express';

const app = express();

app.get('/', (req, res) => {
  res.send('Final Clue Server');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server started in ${process.cwd()} on port ${port}`);
});
