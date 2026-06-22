import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Mock Data
const cases = [
  {
    id: 'c1',
    title: 'The Midnight Burglary',
    date: '2023-05-12',
    location: 'Downtown',
    narrative: 'A store was broken into at midnight.',
    moDescription: 'Broken window',
    moCategories: ['burglary', 'night'],
    entities: { person: [], vehicle: [], location: ['Downtown'], weapon: [] },
    status: 'open',
  },
  {
    id: 'c2',
    title: 'The Art Heist',
    date: '2023-06-20',
    location: 'Uptown Museum',
    narrative: 'Valuable painting stolen from the museum.',
    moDescription: 'Skylight entry',
    moCategories: ['burglary', 'art', 'night'],
    entities: { person: [], vehicle: [], location: ['Uptown Museum'], weapon: [] },
    status: 'open',
  }
];

const linkages = [
  {
    id: 'l1',
    caseA: cases[0],
    caseB: cases[1],
    confidence: 85,
    signals: { semantic: 0.8, entity: 0.2, temporal: 0.5, mo: 0.9 },
    evidence: ['Both happened at night', 'Similar entry style'],
    criticFlags: [],
    summary: 'Potential serial burglar',
    investigatorStatus: 'pending',
  }
];

// Endpoints
app.get('/api/cases', (req, res) => {
  res.json(cases);
});

app.get('/api/cases/:id', (req, res) => {
  const c = cases.find(c => c.id === req.params.id);
  if (c) {
    res.json(c);
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

app.get('/api/linkages', (req, res) => {
  res.json(linkages);
});

app.get('/api/linkages/:caseId', (req, res) => {
  const caseId = req.params.caseId;
  const relatedLinkages = linkages.filter(
    (l) => l.caseA.id === caseId || l.caseB.id === caseId
  );
  res.json(relatedLinkages);
});

if (process.argv[1]?.includes('server.ts') || process.argv[1]?.includes('server.cjs')) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
