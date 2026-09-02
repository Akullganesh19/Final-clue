import React from 'react';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4 text-center text-blue-600">Final Clue System</h1>
        <p className="text-gray-700 text-center">
          A multi-agent case-linkage & evidence-triage system for cold cases.
        </p>
      </div>
    </div>
  );
};

export default App;
