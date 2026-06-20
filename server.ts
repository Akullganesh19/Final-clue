import express from 'express';
// Note: Normally we'd import this but sticking it here for simplicity in the stub
import { mockCases, mockLinkages } from './src/data/mock.js';

const app = express();

app.get('/api/cases', (req, res) => {
  res.json(mockCases);
});

app.get('/api/linkages', (req, res) => {
  res.json(mockLinkages);
});

app.get('/', (req, res) => res.send('Final Clue API'));

app.listen(3000, () => console.log('Server started on port 3000'));
