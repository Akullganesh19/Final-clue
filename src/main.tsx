import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { Case } from './types';

const MOCK_CASES: Case[] = [
  {
    id: "CASE-001",
    title: "Downtown Alley Incident",
    date: "2023-10-15",
    location: "Downtown",
    narrative: "Victim found in alleyway.",
    moDescription: "Ambush",
    moCategories: ["ambush", "nighttime"],
    entities: {
      person: ["John Doe", "Jane Smith"],
      vehicle: ["Black Sedan", "White Van"],
      location: ["Main St Alley"],
      weapon: ["9mm Handgun"]
    },
    status: "cold"
  },
  {
    id: "CASE-002",
    title: "Riverside Warehouse Break-in",
    date: "2023-11-02",
    location: "Riverside",
    narrative: "Warehouse broken into, suspect fled.",
    moDescription: "Forced entry",
    moCategories: ["forced_entry", "nighttime"],
    entities: {
      person: ["Jane Smith", "Mike Jones"],
      vehicle: ["White Van"],
      location: ["Dock 4"],
      weapon: ["Crowbar"]
    },
    status: "open"
  },
  {
    id: "CASE-003",
    title: "Uptown Parking Lot Altercation",
    date: "2024-01-20",
    location: "Uptown",
    narrative: "Argument escalated in parking lot.",
    moDescription: "Public altercation",
    moCategories: ["daytime", "public"],
    entities: {
      person: ["John Doe"],
      vehicle: ["Red Truck", "Black Sedan"],
      location: ["Uptown Mall"],
      weapon: ["9mm Handgun"]
    },
    status: "open"
  }
];

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App cases={MOCK_CASES} />
  </StrictMode>,
);
