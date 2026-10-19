import express, { Request, Response } from 'express';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Mock database of cases based on types.ts
const cases = [
  { id: 'C-001', location: 'Seattle', title: 'The Midnight Shadow', moCategories: ['burglary', 'night'] },
  { id: 'C-002', location: 'Seattle', title: 'Rain City Break-in', moCategories: ['burglary', 'night', 'weapon'] },
  { id: 'C-003', location: 'Portland', title: 'Riverfront Incident', moCategories: ['burglary'] },
];

app.get('/api/cases', (req: Request, res: Response) => {
  res.json(cases);
});

app.get('/api/cases/:id', (req: Request, res: Response) => {
  const c = cases.find(c => c.id === req.params.id);
  if (c) res.json(c);
  else res.status(404).send('Not found');
});

// 🛸 ORACLE PREDICTION ENGINE
// Predict the next case a user will want to view based on the current case's pattern
app.post('/api/predict-next-case', (req: Request, res: Response): void => {
  const { currentCaseId } = req.body;
  const currentCase = cases.find(c => c.id === currentCaseId);

  if (!currentCase) {
    res.json({ predictedCaseId: null });
    return;
  }

  // Predict the next case by finding one with matching location AND at least one MO overlap
  // In a real app, this would use historical sequence data (e.g. "users who viewed X next viewed Y")
  const predicted = cases.find(c =>
    c.id !== currentCaseId &&
    c.location === currentCase.location &&
    c.moCategories.some(mo => currentCase.moCategories.includes(mo))
  );

  res.json({ predictedCaseId: predicted ? predicted.id : null });
});

export default app;

// Ensure we only listen if this file is run directly
if (process.argv[1] && process.argv[1].endsWith('server.ts')) {
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}
