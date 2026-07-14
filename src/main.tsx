import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuditTrail } from './types';
import { actionPredictor } from './utils/ActionPredictor';

// Define realistic mock AuditTrail logs to train the predictor and populate the UI
const mockLogs: AuditTrail[] = [
  {
    id: 'AUDIT-101',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    action: 'login',
    details: 'User authenticated successfully.',
    author: 'Investigator (Arjun Som)',
    hash: 'CHK-A1B2C3D4'
  },
  {
    id: 'AUDIT-102',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    action: 'view_case',
    details: 'Viewed Case 404: The Missing Heir.',
    author: 'Investigator (Arjun Som)',
    hash: 'CHK-E5F6G7H8'
  },
  {
    id: 'AUDIT-103',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    action: 'add_evidence',
    details: 'Uploaded photo of the scene.',
    author: 'Investigator (Arjun Som)',
    hash: 'CHK-I9J0K1L2'
  },
  {
    id: 'AUDIT-104',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    action: 'login',
    details: 'User authenticated successfully.',
    author: 'Investigator (Arjun Som)',
    hash: 'CHK-M3N4O5P6'
  },
  {
    id: 'AUDIT-105',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    action: 'view_case',
    details: 'Viewed Case 405: The Silent Alarm.',
    author: 'Investigator (Arjun Som)',
    hash: 'CHK-Q7R8S9T0'
  },
  {
    id: 'AUDIT-106',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    action: 'add_evidence',
    details: 'Logged witness statement.',
    author: 'Investigator (Arjun Som)',
    hash: 'CHK-U1V2W3X4'
  },
  {
    id: 'AUDIT-107',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    action: 'view_case',
    details: 'Viewed Case 406: The Vanishing Act.',
    author: 'Investigator (Arjun Som)',
    hash: 'CHK-Y5Z6A7B8'
  },
  {
    id: 'AUDIT-108',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
    action: 'read_notes',
    details: 'Read investigator notes.',
    author: 'Investigator (Arjun Som)',
    hash: 'CHK-C9D0E1F2'
  },
  {
    id: 'AUDIT-109',
    timestamp: new Date().toISOString(),
    action: 'view_case',
    details: 'Viewed Case 407: The Last Train.',
    author: 'Investigator (Arjun Som)',
    hash: 'CHK-G3H4I5J6'
  }
];

// Train the predictive engine on the historical data
actionPredictor.train(mockLogs);

// Predict what the user will do next based on their final recorded action
const lastAction = mockLogs[mockLogs.length - 1].action;
const predictedAction = actionPredictor.predictNext(lastAction);

console.log(`[Oracle] Trained on ${mockLogs.length} logs. Last action: ${lastAction}. Predicted next: ${predictedAction}`);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App logs={mockLogs} predictedAction={predictedAction} />
  </StrictMode>,
);
