import React, { useState } from 'react';
import { CaseSeriesBoard } from './components/CaseSeriesBoard';
import { mockCases, mockLinkages } from './data/mock';
import { Layers } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'linkages' | 'series'>('series');

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        <header className="bg-white rounded-xl shadow-sm p-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Final Clue</h1>
            <p className="text-gray-500 mt-1">Multi-agent cold case triage & linkage</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('linkages')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'linkages' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              Pairwise Links
            </button>
            <button
              onClick={() => setActiveTab('series')}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'series' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              <Layers className="w-4 h-4 mr-2" />
              Serial Dossiers
            </button>
          </div>
        </header>

        <main>
          {activeTab === 'series' ? (
            <CaseSeriesBoard cases={mockCases} linkages={mockLinkages} />
          ) : (
            <div className="bg-white p-8 rounded-xl shadow-sm text-center">
              <h2 className="text-xl font-medium text-gray-600">Pairwise Linkages View (Placeholder)</h2>
              <p className="mt-2 text-gray-500">Switch to the "Serial Dossiers" tab to see the Nexus feature.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
