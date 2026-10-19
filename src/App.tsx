import React, { useState, useEffect } from 'react';
import { EntityRadar } from './components/EntityRadar';

function App() {
  const [health, setHealth] = useState<string>('loading...');

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setHealth(data.status))
      .catch(err => setHealth('error'));
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto bg-gray-50 min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Final Clue Dashboard</h1>
        <p className="text-gray-500">System status: {health}</p>
      </header>

      <main>
        <EntityRadar />
      </main>
    </div>
  );
}

export default App;
