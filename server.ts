import express from 'express';
import type { Case, Linkage } from './src/types';

const app = express();

app.use(express.json());

const MOCK_CASES: Case[] = [
  {
    id: '1',
    title: 'The Midnight Burglary',
    date: '2023-01-15',
    location: '123 Elm St',
    narrative: 'A burglary occurred at midnight.',
    moDescription: 'Forced entry through back window.',
    moCategories: ['burglary', 'nighttime'],
    entities: { person: [], vehicle: [], location: [], weapon: [] },
    status: 'cold'
  },
  {
    id: '2',
    title: 'The Downtown Heist',
    date: '2023-02-20',
    location: '456 Oak St',
    narrative: 'A heist occurred in downtown.',
    moDescription: 'Safe cracked.',
    moCategories: ['heist', 'safecracking'],
    entities: { person: [], vehicle: [], location: [], weapon: [] },
    status: 'cold'
  }
];

const MOCK_LINKAGES: Record<string, Linkage[]> = {
  '1': [
    {
      id: 'link1',
      caseA: MOCK_CASES[0],
      caseB: MOCK_CASES[1],
      confidence: 85,
      signals: { semantic: 0.8, entity: 0.9, temporal: 0.2, mo: 0.5 },
      evidence: ['Similar tools used.'],
      criticFlags: [],
      summary: 'Likely the same perpetrator based on tool marks.',
      investigatorStatus: 'pending'
    }
  ]
};

app.get('/api/cases', (req, res) => {
  res.json(MOCK_CASES);
});

app.get('/api/cases/:id/linkages', (req, res) => {
  const linkages = MOCK_LINKAGES[req.params.id] || [];
  res.json(linkages);
});

// Conditionally start server to avoid hanging tests
const isMain = process.argv[1]?.includes('server.ts') || process.argv[1]?.includes('server.cjs');

let server: any;
if (isMain) {
  const PORT = process.env.PORT || 3000;
  server = app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

export { app, server };
