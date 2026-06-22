import express from 'express';
import { findOverlappingEntities } from './src/utils/entityCrossReference';
import { Case } from './src/types';

const app = express();
app.use(express.json());

// Mock data for the endpoint
const mockCases: Case[] = [
  {
    id: 'C-001',
    title: 'Downtown Alley Assault',
    date: '2023-10-15',
    location: 'Downtown',
    narrative: 'Victim assaulted in alley. Suspect drove a black SUV.',
    moDescription: 'Surprise attack, quick escape',
    moCategories: ['Assault'],
    status: 'open',
    entities: {
      person: ['John Smith'],
      vehicle: ['Black SUV'],
      location: ['Downtown Alley'],
      weapon: ['Blunt object']
    }
  },
  {
    id: 'C-002',
    title: 'Riverside Robbery',
    date: '2023-11-02',
    location: 'Riverside',
    narrative: 'Store robbed. Getaway car was a black SUV. Weapon used was a blunt object.',
    moDescription: 'Armed robbery, quick escape',
    moCategories: ['Robbery'],
    status: 'open',
    entities: {
      person: ['Jane Doe'],
      vehicle: ['Black SUV'],
      location: ['Riverside Store'],
      weapon: ['Blunt object']
    }
  },
  {
    id: 'C-003',
    title: 'Suburban Break-in',
    date: '2023-12-10',
    location: 'Suburbs',
    narrative: 'House broken into. Suspect identified as John Smith.',
    moDescription: 'Forced entry',
    moCategories: ['Burglary'],
    status: 'open',
    entities: {
      person: ['John Smith', 'Robert Jones'],
      vehicle: ['White Sedan'],
      location: ['Suburban House'],
      weapon: ['Crowbar']
    }
  }
];

app.get('/api/cases/overlap', (req, res) => {
  const overlaps = findOverlappingEntities(mockCases);
  res.json(overlaps);
});

// For testing purposes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

if (process.argv[1]?.includes('server.ts') || process.argv[1]?.includes('server.cjs')) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

export default app;
