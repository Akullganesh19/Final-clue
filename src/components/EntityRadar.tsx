import React, { useEffect, useState } from 'react';
import { EntityRadarData, Case } from '../types';
import { computeEntityRadar } from '../utils/entityRadar';
import { AlertCircle, Activity, Crosshair, MapPin, Users, Car } from 'lucide-react';

export function EntityRadar() {
  const [radarData, setRadarData] = useState<EntityRadarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/entities/radar')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch cases');
        return res.json();
      })
      .then(data => {
        const radar = computeEntityRadar(data.cases as Case[]);
        setRadarData(radar);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-4 flex items-center gap-2"><Activity className="animate-spin text-blue-500" /> <span>Scanning global entities...</span></div>;
  if (error) return <div className="p-4 flex items-center gap-2 text-red-500"><AlertCircle /> <span>Error loading entity radar: {error}</span></div>;
  if (!radarData) return null;

  const hasData =
    radarData.persons.length > 0 ||
    radarData.vehicles.length > 0 ||
    radarData.locations.length > 0 ||
    radarData.weapons.length > 0;

  if (!hasData) return <div className="p-4 text-gray-500 italic">No recurring entities found across cases.</div>;

  const renderSection = (title: string, icon: React.ReactNode, entities: EntityRadarData['persons'], colorClass: string) => {
    if (entities.length === 0) return null;
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
          {icon}
          {title}
        </h3>
        <div className="flex flex-wrap gap-3">
          {entities.map(e => (
            <div key={`${e.type}-${e.name}`} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border ${colorClass} ${e.count > 1 ? 'border-2 font-medium shadow-sm' : 'opacity-70'}`}>
              <span>{e.name}</span>
              <span className="bg-white/50 px-1.5 py-0.5 rounded-md text-xs font-bold">{e.count} {e.count === 1 ? 'case' : 'cases'}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
        <Activity className="text-indigo-600" />
        <h2 className="text-xl font-bold text-gray-800">Global Entity Radar</h2>
        <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full font-medium ml-auto">
          Nexus Pattern Detection
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
        {renderSection('Weapons', <Crosshair className="w-5 h-5 text-red-500" />, radarData.weapons, 'bg-red-50 text-red-700 border-red-200')}
        {renderSection('Vehicles', <Car className="w-5 h-5 text-blue-500" />, radarData.vehicles, 'bg-blue-50 text-blue-700 border-blue-200')}
        {renderSection('Persons of Interest', <Users className="w-5 h-5 text-purple-500" />, radarData.persons, 'bg-purple-50 text-purple-700 border-purple-200')}
        {renderSection('Locations', <MapPin className="w-5 h-5 text-emerald-500" />, radarData.locations, 'bg-emerald-50 text-emerald-700 border-emerald-200')}
      </div>
    </div>
  );
}
