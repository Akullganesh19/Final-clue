import express from 'express';
import { Linkage } from './src/types.js';

const app = express();
app.use(express.json());

// Dummy data
export const dummyLinkages: Linkage[] = [
  {
    id: 'link-1',
    caseA: {
      id: 'case-1',
      title: 'Riverside Jane Doe',
      date: '1995-10-15',
      location: 'Riverside, CA',
      narrative: 'Found near riverbed.',
      moDescription: 'Asphyxiation',
      moCategories: ['asphyxiation'],
      entities: { person: [], vehicle: [], location: [], weapon: [] },
      status: 'cold'
    },
    caseB: {
      id: 'case-2',
      title: 'Meadow Park John Doe',
      date: '1996-03-22',
      location: 'Riverside, CA',
      narrative: 'Found in park.',
      moDescription: 'Asphyxiation',
      moCategories: ['asphyxiation'],
      entities: { person: [], vehicle: [], location: [], weapon: [] },
      status: 'cold'
    },
    confidence: 85,
    signals: { semantic: 0.8, entity: 0.9, temporal: 0.7, mo: 0.9 },
    evidence: ['Both asphyxiated', 'Same city'],
    criticFlags: [],
    summary: 'High similarity in MO and location.',
    investigatorStatus: 'confirmed'
  },
  {
    id: 'link-2',
    caseA: {
      id: 'case-3',
      title: 'Downtown Burglary Series',
      date: '2001-05-10',
      location: 'Chicago, IL',
      narrative: 'Jewelry stolen.',
      moDescription: 'Window entry',
      moCategories: ['burglary', 'window'],
      entities: { person: [], vehicle: [], location: [], weapon: [] },
      status: 'cold'
    },
    caseB: {
      id: 'case-4',
      title: 'Uptown Break-in',
      date: '2001-06-12',
      location: 'Chicago, IL',
      narrative: 'Safe cracked.',
      moDescription: 'Window entry',
      moCategories: ['burglary', 'window'],
      entities: { person: [], vehicle: [], location: [], weapon: [] },
      status: 'cold'
    },
    confidence: 60,
    signals: { semantic: 0.5, entity: 0.6, temporal: 0.8, mo: 0.7 },
    evidence: ['Window entry'],
    criticFlags: [{ type: 'warning', message: 'Different items targeted.' }],
    summary: 'Possible linkage due to entry method.',
    investigatorStatus: 'pending'
  }
];

app.get('/api/linkages', (req, res) => {
  res.json(dummyLinkages);
});

app.get('/api/export/linkages/csv', (req, res) => {
  try {
    const confirmedLinkages = dummyLinkages.filter(l => l.investigatorStatus === 'confirmed');

    // Create CSV header
    const headers = [
      'Linkage ID',
      'Confidence',
      'Case A ID',
      'Case A Title',
      'Case B ID',
      'Case B Title',
      'Summary',
      'Status'
    ];

    // Create CSV rows
    const rows = confirmedLinkages.map(l => {
      return [
        l.id,
        l.confidence.toString(),
        l.caseA.id,
        `"${l.caseA.title.replace(/"/g, '""')}"`,
        l.caseB.id,
        `"${l.caseB.title.replace(/"/g, '""')}"`,
        `"${l.summary.replace(/"/g, '""')}"`,
        l.investigatorStatus
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="confirmed_linkages.csv"');
    res.status(200).send(csvContent);
  } catch (error) {
    console.error('Error generating CSV export:', error);
    res.status(500).send('Internal Server Error');
  }
});

const isMainModule = process.argv[1]?.includes('server.ts') || process.argv[1]?.includes('server.cjs');

if (isMainModule) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
