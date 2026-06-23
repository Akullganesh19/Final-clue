import React, { useEffect, useState } from 'react';
import { dedupedFetch } from './utils/apiClient.ts';

export default function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    // Demonstration of Phantom agent infrastructure improvement
    dedupedFetch('/api/health')
      .then(res => setData(res))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h1>Final Clue</h1>
      {data ? <p>Status: {data.status}</p> : <p>Loading...</p>}
    </div>
  );
}
