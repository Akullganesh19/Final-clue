import React, { useState } from 'react';
import { Case } from './types';
import { EntityOverlapAnalyzer } from './components/EntityOverlapAnalyzer';

// Mock cases data to demonstrate the entity overlap feature
const mockCases: Case[] = [
  {
    id: "CASE-001",
    title: "Riverside Market Incident",
    date: "2023-05-12",
    location: "Riverside Market",
    narrative: "Suspicious activity reported near the market.",
    moDescription: "Night time scouting",
    moCategories: ["scouting", "night"],
    entities: {
      person: ["John Doe", "Jane Smith"],
      vehicle: ["Black Sedan", "White Van"],
      location: ["Riverside Market", "Downtown"],
      weapon: ["Knife"]
    },
    status: "open"
  },
  {
    id: "CASE-002",
    title: "Downtown Alley Robbery",
    date: "2023-06-15",
    location: "Downtown",
    narrative: "Robbery in the downtown alleyway.",
    moDescription: "Alleyway ambush",
    moCategories: ["ambush", "alleyway"],
    entities: {
      person: ["Jane Smith", "Mike Johnson"],
      vehicle: ["White Van", "Red Motorcycle"],
      location: ["Downtown", "Eastside"],
      weapon: ["Handgun", "Knife"]
    },
    status: "open"
  },
  {
    id: "CASE-003",
    title: "Eastside Warehouse Break-in",
    date: "2023-07-20",
    location: "Eastside Warehouse",
    narrative: "Break-in at the local warehouse.",
    moDescription: "Forced entry",
    moCategories: ["break-in", "forced entry"],
    entities: {
      person: ["John Doe", "Unknown Male"],
      vehicle: ["Black Sedan"],
      location: ["Eastside Warehouse", "Riverside Market"],
      weapon: ["Crowbar"]
    },
    status: "open"
  }
];

export default function App() {
  const [cases] = useState<Case[]>(mockCases);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900">Final Clue</h1>
          <p className="text-gray-500 mt-2">Cold Case Evidence Triage System</p>
        </header>

        {/* Emergent Feature: Entity Overlap Analyzer */}
        <EntityOverlapAnalyzer cases={cases} />
      </div>
    </div>
  );
}
