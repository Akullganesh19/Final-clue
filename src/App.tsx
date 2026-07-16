import React from 'react';
import { CrossCaseEntityDashboard } from './components/CrossCaseEntityDashboard';
import { Case } from './types';

const mockCases: Case[] = [
  {
    id: 'CASE-001',
    title: 'The Riverside Enigma',
    date: '1998-10-14',
    location: 'Riverside, CA',
    narrative: 'Victim found near the river.',
    moDescription: 'Night time ambush',
    moCategories: ['ambush', 'night'],
    entities: {
      person: ['John Doe', 'Jane Smith', 'Mystery Man'],
      vehicle: ['Blue Ford Taurus', 'White Van'],
      location: ['Riverside Park', 'Main St. Diner'],
      weapon: ['.38 Caliber Revolver', 'Rope']
    },
    status: 'cold'
  },
  {
    id: 'CASE-002',
    title: 'Downtown Disappearance',
    date: '2001-05-22',
    location: 'Los Angeles, CA',
    narrative: 'Person went missing from a diner.',
    moDescription: 'Abduction from public place',
    moCategories: ['abduction'],
    entities: {
      person: ['Jane Smith', 'Witness A'],
      vehicle: ['White van', 'Red Sedan'],
      location: ['Main St. Diner', 'Downtown LA'],
      weapon: ['Rope']
    },
    status: 'cold'
  },
  {
    id: 'CASE-003',
    title: 'Suburban Shadow',
    date: '2005-11-03',
    location: 'Pasadena, CA',
    narrative: 'Break-in with similar MO.',
    moDescription: 'Forced entry at night',
    moCategories: ['forced entry', 'night'],
    entities: {
      person: ['Suspect X', 'Mystery Man'],
      vehicle: ['black suv', 'White van'],
      location: ['Pasadena Suburbs', 'Riverside Park'],
      weapon: ['Crowbar', '.38 Caliber Revolver']
    },
    status: 'open'
  }
];

function App() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <header className="max-w-4xl mx-auto px-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Final Clue System</h1>
        <p className="text-gray-500">Case Linkage & Evidence Triage</p>
      </header>

      <main>
        <CrossCaseEntityDashboard cases={mockCases} />
      </main>
    </div>
  );
}

export default App;
