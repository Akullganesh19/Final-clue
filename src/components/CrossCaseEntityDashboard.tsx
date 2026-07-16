import React from 'react';
import { Case } from '../types';
import { analyzeCrossCaseEntities, AggregatedEntity } from '../utils/entityAnalyzer';

interface Props {
  cases: Case[];
}

export const CrossCaseEntityDashboard: React.FC<Props> = ({ cases }) => {
  const aggregatedEntities = analyzeCrossCaseEntities(cases);

  const renderCategory = (title: string, entities: AggregatedEntity[]) => {
    // Filter for entities that appear in more than 1 case
    const recurring = entities.filter(e => e.caseIds.length > 1);

    return (
      <div className="mb-6 p-4 border rounded shadow-sm bg-white" key={title}>
        <h3 className="text-lg font-bold mb-3 capitalize text-gray-800">{title} ({recurring.length} Recurring)</h3>
        {recurring.length === 0 ? (
          <p className="text-gray-500 italic">No recurring {title} entities found across multiple cases.</p>
        ) : (
          <ul className="space-y-2">
            {recurring.map((entity, idx) => (
              <li key={idx} className="flex flex-col bg-gray-50 p-2 rounded">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-blue-700">{entity.name}</span>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    {entity.count} mentions
                  </span>
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  Cases: {entity.caseIds.join(', ')}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-extrabold mb-2 text-gray-900">Cross-Case Entity Intelligence</h2>
      <p className="text-gray-600 mb-6">
        Automatically identifying recurring entities (people, vehicles, locations, weapons) across multiple cold cases to surface hidden connections.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderCategory('person', aggregatedEntities.person)}
        {renderCategory('vehicle', aggregatedEntities.vehicle)}
        {renderCategory('location', aggregatedEntities.location)}
        {renderCategory('weapon', aggregatedEntities.weapon)}
      </div>
    </div>
  );
};
