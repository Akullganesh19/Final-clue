import React, { useState, useEffect } from 'react';

function App() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchEvidence = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/evidence');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const result = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Final Clue Evidence Triage</h1>
      <button
        onClick={fetchEvidence}
        className="px-4 py-2 bg-blue-500 text-white rounded mb-4"
        disabled={loading}
      >
        {loading ? 'Fetching...' : 'Fetch Evidence'}
      </button>

      {error && <div className="text-red-500">Error: {error}</div>}

      {data && (
        <div className="bg-gray-100 p-4 rounded">
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default App;
