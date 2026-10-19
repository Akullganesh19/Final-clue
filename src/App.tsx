import React, { useState } from 'react';

export default function App() {
  const [data, setData] = useState<string | null>(null);

  const handleAnalyze = async () => {
    try {
      const response = await fetch('/api/analyze/123');
      const result = await response.json();
      setData(JSON.stringify(result));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Final Clue - Cold Case Evidence Triage</h1>
      <button onClick={handleAnalyze} className="bg-blue-500 text-white px-4 py-2 mt-4 rounded">
        Analyze Case
      </button>
      {data && <pre className="mt-4 p-4 bg-gray-100 rounded">{data}</pre>}
    </div>
  );
}
