import React from 'react';
import { EntityDossier } from '../utils/entityTracker';
import { Users, Car, MapPin, Search } from 'lucide-react';

interface EntityDossierViewProps {
  dossiers: EntityDossier[];
}

export const EntityDossierView: React.FC<EntityDossierViewProps> = ({ dossiers }) => {
  if (!dossiers || dossiers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg shadow border border-gray-200">
        <Search className="w-12 h-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">No Cross-Case Entities Found</h3>
        <p className="text-gray-500 text-center max-w-sm">
          No people, vehicles, locations, or weapons were found linking multiple cases.
        </p>
      </div>
    );
  }

  const getIconForType = (type: string) => {
    switch (type) {
      case 'person': return <Users className="w-5 h-5 text-blue-500" />;
      case 'vehicle': return <Car className="w-5 h-5 text-green-500" />;
      case 'location': return <MapPin className="w-5 h-5 text-red-500" />;
      default: return <Search className="w-5 h-5 text-gray-500" />;
    }
  };

  const getBadgeColorForType = (type: string) => {
    switch (type) {
      case 'person': return 'bg-blue-100 text-blue-800';
      case 'vehicle': return 'bg-green-100 text-green-800';
      case 'location': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Entity Dossiers</h2>
        <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
          {dossiers.length} Cross-Case {dossiers.length === 1 ? 'Entity' : 'Entities'}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {dossiers.map((dossier, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full bg-white shadow-sm`}>
                  {getIconForType(dossier.entityType)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{dossier.entityName}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${getBadgeColorForType(dossier.entityType)}`}>
                      {dossier.entityType.charAt(0).toUpperCase() + dossier.entityType.slice(1)}
                    </span>
                    <span className="text-xs text-gray-500">
                      Spans {dossier.timespanDays} days
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-gray-900">{dossier.appearances.length}</span>
                <span className="text-sm text-gray-500 block">Appearances</span>
              </div>
            </div>

            <div className="p-5">
              <div className="relative border-l border-gray-200 ml-3 space-y-6">
                {dossier.appearances.map((app, appIdx) => (
                  <div key={appIdx} className="relative pl-6">
                    <span className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-indigo-500 ring-4 ring-white"></span>
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between mb-1">
                      <h4 className="text-sm font-semibold text-gray-900">{app.caseTitle}</h4>
                      <time className="text-xs font-medium text-gray-500">
                        {new Date(app.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </time>
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <span>Case ID: {app.caseId}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
