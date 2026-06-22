import express from 'express';
import { AuditTrail } from './src/types.js';
import { createAuditLog } from './src/utils/audit.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

let serverAuditTrail: AuditTrail[] = [];

app.post('/api/audit', (req, res) => {
  const { action, details, author } = req.body;
  if (!action || !details) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    serverAuditTrail = createAuditLog(serverAuditTrail, action, details, author);
    const newLog = serverAuditTrail[serverAuditTrail.length - 1];
    res.status(201).json(newLog);
  } catch (err) {
    console.error('Failed to create audit log', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/audit', (req, res) => {
  res.json(serverAuditTrail);
});

if (process.argv[1]?.includes('server.ts')) {
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

export default app;
