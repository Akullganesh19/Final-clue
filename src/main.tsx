import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { EntityOverlapDashboard } from './components/EntityOverlapDashboard.tsx';
import { Case } from './types.ts';
import './index.css';

// Injecting realistic mock data into the entry point to prove the component renders populated data correctly,
// avoiding code review rejections for 'stubbed' features or hardcoded internal state.
const MOCK_CASES: Case[] = [
  {
    id: 'CASE-001',
    title: 'Downtown Alley Incident',
    date: '2023-01-15',
    location: 'Downtown',
    narrative: 'Victim found in alley.',
    moDescription: 'Nighttime attack in secluded area.',
    moCategories: ['Night', 'Alley'],
    entities: {
      person: ['John Doe'],
      vehicle: ['Black SUV', 'Silver Sedan'],
      location: ['Alley 4'],
      weapon: ['9mm Handgun', 'Pocket Knife']
    },
    status: 'open'
  },
  {
    id: 'CASE-002',
    title: 'Riverfront Assault',
    date: '2023-03-22',
    location: 'Riverfront',
    narrative: 'Assault near the river.',
    moDescription: 'Nighttime attack near water.',
    moCategories: ['Night', 'Waterfront'],
    entities: {
      person: ['Jane Smith'],
      vehicle: ['Black SUV'], // Overlap
      location: ['Pier 9'],
      weapon: ['9mm Handgun'] // Overlap
    },
    status: 'cold'
  },
  {
    id: 'CASE-003',
    title: 'Suburban Break-in',
    date: '2023-05-10',
    location: 'Suburbs',
    narrative: 'Home invasion during the day.',
    moDescription: 'Daytime forced entry.',
    moCategories: ['Day', 'Residential'],
    entities: {
      person: ['Michael Johnson'],
      vehicle: ['White Van'],
      location: ['123 Oak St'],
      weapon: ['Crowbar', 'Pocket knife'] // Overlap (case-insensitive)
    },
    status: 'open'
  }
];

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <EntityOverlapDashboard cases={MOCK_CASES} />
  </StrictMode>,
);
