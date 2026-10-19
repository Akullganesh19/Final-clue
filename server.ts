import express from 'express';

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Final Clue Cold Case Evidence Triage System');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
