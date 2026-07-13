import React, { useEffect, useState } from 'react';
import { Case } from './types';

export default function App() {
  const [cases, setCases] = useState<Case[]>([]);

  useEffect(() => {
    // Mock data injection to prove the component renders populated data correctly
    setCases([{
      id: '1',
      title: 'Mock Case 1',
      date: '2023-01-01',
      location: 'City Center',
      narrative: 'A mock case for testing.',
      moDescription: 'Unknown',
      moCategories: [],
      entities: { person: [], vehicle: [], location: [], weapon: [] },
      status: 'open'
    }]);
  }, []);

  return (
    <div>
      <h1>Final Clue Cases</h1>
      <ul>
        {cases.map(c => (
          <li key={c.id}>{c.title} - {c.status}</li>
        ))}
      </ul>
    </div>
  );
}
