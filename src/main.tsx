import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
// import App from './App.tsx'; // App.tsx is missing in the boilerplate
import './index.css';
import { ClusterDashboard } from './components/ClusterDashboard.tsx';

import { Case, Linkage } from './types.ts';

const mockCases: Case[] = [
  { id: 'c1', title: 'Case 1', date: '2023-01-01', location: 'City A', narrative: '', moDescription: '', moCategories: ['Nighttime', 'Home Invasion', 'Weapon: Knife'], entities: { person: [], vehicle: [], location: [], weapon: [] }, status: 'open' },
  { id: 'c2', title: 'Case 2', date: '2023-02-01', location: 'City B', narrative: '', moDescription: '', moCategories: ['Nighttime', 'Home Invasion', 'Stolen Items'], entities: { person: [], vehicle: [], location: [], weapon: [] }, status: 'open' },
  { id: 'c3', title: 'Case 3', date: '2023-03-01', location: 'City C', narrative: '', moDescription: '', moCategories: ['Nighttime', 'Home Invasion', 'Solo Victim'], entities: { person: [], vehicle: [], location: [], weapon: [] }, status: 'open' }
];

const mockLinkages: Linkage[] = [
  { id: 'l1', caseA: mockCases[0], caseB: mockCases[1], confidence: 85, signals: { semantic: 0, entity: 0, temporal: 0, mo: 0 }, evidence: [], criticFlags: [], summary: '', investigatorStatus: 'pending' },
  { id: 'l2', caseA: mockCases[1], caseB: mockCases[2], confidence: 90, signals: { semantic: 0, entity: 0, temporal: 0, mo: 0 }, evidence: [], criticFlags: [], summary: '', investigatorStatus: 'pending' }
];

// Boilerplate fallback for missing App.tsx
const App = () => (
  <div className="p-8 bg-gray-100 min-h-screen">
    <h1 className="text-3xl font-bold mb-8 text-gray-800">Final Clue System</h1>
    <ClusterDashboard cases={mockCases} linkages={mockLinkages} />
  </div>
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);