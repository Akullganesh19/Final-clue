import React from 'react';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-8">
      <header className="mb-12 text-center">
        <h1 className="text-5xl font-bold font-serif text-[#c5a059] mb-4">Final Clue</h1>
        <p className="text-xl text-gray-400 font-sans max-w-2xl">
          A multi-agent case-linkage & evidence-triage system for cold cases.
        </p>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <div className="bg-[#0e0e0e] border border-[#1a1a1a] p-6 rounded-lg hover:border-[#222222] transition-colors">
          <h2 className="text-2xl font-semibold mb-3 text-[#c5a059]">Case Linkage</h2>
          <p className="text-gray-400 font-sans">
            Semantic similarity analysis between cold cases to find non-obvious connections across jurisdictions.
          </p>
        </div>

        <div className="bg-[#0e0e0e] border border-[#1a1a1a] p-6 rounded-lg hover:border-[#222222] transition-colors">
          <h2 className="text-2xl font-semibold mb-3 text-[#c5a059]">Evidence Triage</h2>
          <p className="text-gray-400 font-sans">
            Intelligent categorization and ranking of evidence using multi-agent critique and scoring.
          </p>
        </div>

        <div className="bg-[#0e0e0e] border border-[#1a1a1a] p-6 rounded-lg hover:border-[#222222] transition-colors">
          <h2 className="text-2xl font-semibold mb-3 text-[#c5a059]">Interactive Visualization</h2>
          <p className="text-gray-400 font-sans">
            Explore complex relationships with force-directed network graphs and heatmap matrices.
          </p>
        </div>

        <div className="bg-[#0e0e0e] border border-[#1a1a1a] p-6 rounded-lg hover:border-[#222222] transition-colors">
          <h2 className="text-2xl font-semibold mb-3 text-[#c5a059]">Audit Trail</h2>
          <p className="text-gray-400 font-sans">
            Complete blockchain-style audit logging of all operations to ensure investigative integrity.
          </p>
        </div>
      </main>

      <footer className="mt-16 text-gray-500 text-sm font-mono">
        System initialized. Agents standing by.
      </footer>
    </div>
  );
};

export default App;
