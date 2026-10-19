import { useEffect, useState } from 'react';
import { Target, TrendingUp, AlertCircle, FileText } from 'lucide-react';

interface SolvabilityScore {
  caseId: string;
  title: string;
  status: string;
  date: string;
  score: number;
  reasons: string[];
  moCategories: string[];
  entityCount: number;
}

export default function App() {
  const [scores, setScores] = useState<SolvabilityScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const response = await fetch('/api/cases/solvability');
        if (!response.ok) {
          throw new Error('Failed to fetch solvability scores');
        }
        const data = await response.json();
        setScores(data.cases);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Target className="w-8 h-8 text-blue-600" />
              Final Clue: Triage Dashboard
            </h1>
            <p className="text-gray-500 mt-2">Emergent Intelligence: Automated Cold Case Solvability Scorer</p>
          </div>
        </header>

        {loading && (
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-gray-200 rounded-xl w-full"></div>
            <div className="h-32 bg-gray-200 rounded-xl w-full"></div>
            <div className="h-32 bg-gray-200 rounded-xl w-full"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && scores.length === 0 && (
          <div className="bg-white p-12 text-center rounded-2xl border border-gray-200 shadow-sm">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No cases found</h3>
            <p className="text-gray-500">Add cases to the system to see their solvability scores.</p>
          </div>
        )}

        {!loading && !error && scores.length > 0 && (
          <div className="grid gap-6">
            {scores.map((score, index) => (
              <div
                key={score.caseId}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all hover:shadow-md"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-gray-500">#{index + 1}</span>
                        <h2 className="text-xl font-bold">{score.title}</h2>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider ${
                          score.status === 'open' ? 'bg-green-100 text-green-800' :
                          score.status === 'linked' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {score.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">ID: {score.caseId} • {new Date(score.date).toLocaleDateString()}</p>
                    </div>

                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-2">
                        <TrendingUp className={`w-5 h-5 ${
                          score.score >= 70 ? 'text-green-500' :
                          score.score >= 40 ? 'text-yellow-500' :
                          'text-red-500'
                        }`} />
                        <span className="text-3xl font-black">{score.score}</span>
                      </div>
                      <span className="text-xs font-medium text-gray-400 uppercase tracking-widest mt-1">Solvability</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-100 grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        Score Drivers
                      </h3>
                      <ul className="space-y-2">
                        {score.reasons.map((reason, i) => (
                          <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></span>
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-2">Data Completeness</h3>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Extracted Entities</span>
                          <span className="font-medium">{score.entityCount}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm mt-1">
                          <span className="text-gray-600">MO Categories</span>
                          <span className="font-medium">{score.moCategories.length}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
