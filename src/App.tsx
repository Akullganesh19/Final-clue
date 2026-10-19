import { AuditTrail } from './types';

interface AppProps {
  logs: AuditTrail[];
  predictedAction: string | null;
}

export default function App({ logs = [], predictedAction = null }: AppProps) {
  return (
    <div className="p-8 max-w-4xl mx-auto font-sans">
      <h1 className="text-3xl font-bold mb-6">Investigator Activity</h1>

      {predictedAction && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative mb-8 flex items-center gap-3 shadow-sm transition-all">
          <span className="text-xl">🛸</span>
          <div>
            <strong className="font-semibold block">Oracle Intelligence</strong>
            <span className="block sm:inline">Predicted next action: <span className="font-bold underline decoration-blue-400 underline-offset-4">{predictedAction}</span></span>
          </div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {logs.map((log) => (
            <li key={log.id} className="p-4 hover:bg-gray-50">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-800">{log.action}</span>
                <span className="text-sm text-gray-500">{new Date(log.timestamp).toLocaleString()}</span>
              </div>
              <div className="text-sm text-gray-600 mt-1">{log.details}</div>
              <div className="text-xs text-gray-400 mt-2 font-mono break-all">{log.hash}</div>
            </li>
          ))}
          {logs.length === 0 && (
            <li className="p-4 text-gray-500 italic">No activity logs available.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
