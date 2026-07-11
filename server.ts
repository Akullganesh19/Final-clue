import express from 'express';
const app = express();

app.get('/api/cases', (req, res) => res.json([]));

app.listen(3000, () => console.log('Server running on port 3000'));
