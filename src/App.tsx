import React from 'react';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <header className="bg-blue-600 text-white w-full p-4 shadow-md text-center">
        <h1 className="text-2xl font-bold">Final Clue System</h1>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl text-center">
          <h2 className="text-xl font-semibold mb-4">Case Linkage & Evidence Triage</h2>
          <p className="text-gray-600">
            Welcome to the multi-agent system for analyzing cold cases.
            Select an agent to begin the investigation.
          </p>
        </div>
      </main>
    </div>
  );
};

export default App;
