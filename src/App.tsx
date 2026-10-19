import React from 'react';
import { Case } from './types';
import { EntityHotspots } from './components/EntityHotspots';

export default function App() {
  const mockCases: Case[] = [
    {
      id: 'C-001',
      title: 'The Downtown Ghost',
      date: '2023-01-15',
      location: 'Downtown',
      narrative: 'A string of robberies.',
      moDescription: 'Night time.',
      moCategories: ['night', 'robbery'],
      entities: {
        person: ['Arthur Pendelton', 'Jane Smith'],
        vehicle: ['Black SUV'],
        location: ['1st Ave Bank', 'Alleyway'],
        weapon: ['Crowbar']
      },
      status: 'cold'
    },
    {
      id: 'C-002',
      title: 'Midtown Heist',
      date: '2023-04-20',
      location: 'Midtown',
      narrative: 'Another robbery.',
      moDescription: 'Late night.',
      moCategories: ['night', 'robbery'],
      entities: {
        person: ['Arthur Pendelton', 'John Doe'],
        vehicle: ['White Van'],
        location: ['2nd Ave Jewelry', 'Alleyway'],
        weapon: ['Pistol']
      },
      status: 'open'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <header>
          <h1 className="text-3xl font-bold text-gray-900">Final Clue Dashboard</h1>
          <p className="text-gray-500 mt-1">Multi-agent case-linkage & evidence-triage system</p>
        </header>

        <main className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Intelligence Overview</h2>
          <EntityHotspots cases={mockCases} />
        </main>
      </div>
    </div>
  );
}
