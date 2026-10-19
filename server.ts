import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/entities/radar', (req, res) => {
  const mockCases = [
    {
      id: 'case-1',
      title: 'Riverfront Incident',
      date: '2023-01-15',
      location: 'Downtown',
      narrative: '',
      moDescription: '',
      moCategories: [],
      entities: {
        person: ['John Doe'],
        vehicle: ['Silver Honda Civic'],
        location: ['Riverfront Park'],
        weapon: ['.38 caliber revolver']
      },
      status: 'cold'
    },
    {
      id: 'case-2',
      title: 'Alleyway robbery',
      date: '2023-02-20',
      location: 'Westside',
      narrative: '',
      moDescription: '',
      moCategories: [],
      entities: {
        person: ['Jane Smith'],
        vehicle: ['Silver Honda Civic'],
        location: ['Dark Alley'],
        weapon: ['.38 caliber revolver']
      },
      status: 'cold'
    },
    {
      id: 'case-3',
      title: 'Warehouse break-in',
      date: '2023-03-05',
      location: 'Industrial District',
      narrative: '',
      moDescription: '',
      moCategories: [],
      entities: {
        person: ['Unknown Suspect'],
        vehicle: ['Black Ford F150'],
        location: ['Abandoned Warehouse'],
        weapon: ['Crowbar', '.38 caliber revolver']
      },
      status: 'cold'
    }
  ];

  res.json({ cases: mockCases });
});

// Conditionally start the server
if (process.argv[1]?.includes('server.ts') || process.argv[1]?.includes('server.cjs')) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
