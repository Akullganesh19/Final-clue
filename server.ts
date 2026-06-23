import express from 'express';
import type { Case, Linkage } from './src/types';
import cors from 'cors';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Mock Data
const MOCK_CASES: Case[] = [
  {
    id: 'c1',
    title: 'The Riverside Enigma',
    date: '2005-10-12',
    location: 'Riverside Park, NY',
    narrative: 'Victim found near the river bank.',
    moDescription: 'Strangulation using a wire.',
    moCategories: ['strangulation', 'outdoor'],
    entities: { person: [], vehicle: [], location: [], weapon: ['wire'] },
    status: 'cold'
  },
  {
    id: 'c2',
    title: 'Harbor Point Mystery',
    date: '2008-04-03',
    location: 'Harbor Point, NY',
    narrative: 'Body discovered in an abandoned warehouse near water.',
    moDescription: 'Strangulation, likely wire or cord.',
    moCategories: ['strangulation', 'indoor', 'water-proximate'],
    entities: { person: [], vehicle: [], location: [], weapon: ['wire/cord'] },
    status: 'cold'
  },
  {
    id: 'c3',
    title: 'Downtown Incident',
    date: '2012-11-20',
    location: 'Downtown, NY',
    narrative: 'Robbery gone wrong in an alleyway.',
    moDescription: 'Blunt force trauma.',
    moCategories: ['blunt-force', 'robbery', 'outdoor'],
    entities: { person: [], vehicle: [], location: [], weapon: ['pipe'] },
    status: 'open'
  }
];

const MOCK_LINKAGES: Linkage[] = [
  {
    id: 'l1',
    caseA: MOCK_CASES[0],
    caseB: MOCK_CASES[1],
    confidence: 85,
    signals: { semantic: 0.8, entity: 0.9, temporal: 0.4, mo: 0.9 },
    evidence: ['Both victims strangled with wire-like object near water.'],
    criticFlags: [],
    summary: 'High similarity in MO and geographic proximity to water.',
    investigatorStatus: 'pending'
  }
];

// Artificial Latency to simulate real-world DB
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

app.get('/api/cases', async (req, res) => {
  await delay(800); // 800ms latency
  res.json(MOCK_CASES);
});

app.get('/api/cases/:id', async (req, res) => {
  await delay(600);
  const c = MOCK_CASES.find(c => c.id === req.params.id);
  if (!c) {
    res.status(404).json({ error: 'Case not found' });
  } else {
    res.json(c);
  }
});

app.get('/api/cases/:id/linkages', async (req, res) => {
  await delay(700); // 700ms latency
  const id = req.params.id;
  const linkages = MOCK_LINKAGES.filter(l => l.caseA.id === id || l.caseB.id === id);
  res.json(linkages);
});

// Conditionally start the server to avoid test runner hangs and EADDRINUSE errors during build
if (process.argv[1]?.includes('server.ts') || process.argv[1]?.includes('server.cjs')) {
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

export default app;
