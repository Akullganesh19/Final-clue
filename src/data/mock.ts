import { Case, Linkage } from '../types';

export const mockCases: Case[] = [
  {
    id: "C-1982-01",
    title: "River Road Incident",
    date: "1982-04-12",
    location: "River Road, Northside",
    narrative: "Victim found near the river bank. Signs of struggle.",
    moDescription: "Ambush near water sources late at night.",
    moCategories: ["ambush", "water-proximity", "night"],
    entities: { person: ["John Doe"], vehicle: ["Blue Sedan"], location: ["River Road"], weapon: ["Blunt force"] },
    status: "cold"
  },
  {
    id: "C-1982-05",
    title: "Lakeside Park Assault",
    date: "1982-06-20",
    location: "Lakeside Park, Eastside",
    narrative: "Attack reported near the park lake.",
    moDescription: "Surprise attack near standing water after dark.",
    moCategories: ["ambush", "water-proximity", "night"],
    entities: { person: ["Jane Smith"], vehicle: ["Unknown"], location: ["Lakeside Park"], weapon: ["Blunt force"] },
    status: "cold"
  },
  {
    id: "C-1983-02",
    title: "Creek Path Attack",
    date: "1983-09-15",
    location: "Creek Path, Westside",
    narrative: "Jogger attacked along the creek path.",
    moDescription: "Attacker hid in bushes near water.",
    moCategories: ["ambush", "water-proximity", "evening"],
    entities: { person: ["Alice Brown"], vehicle: ["None"], location: ["Creek Path"], weapon: ["Unknown object"] },
    status: "cold"
  },
  {
    id: "C-1985-11",
    title: "Downtown Burglary",
    date: "1985-11-05",
    location: "Downtown",
    narrative: "Store broken into overnight.",
    moDescription: "Smashed window entry.",
    moCategories: ["burglary", "night"],
    entities: { person: ["Store Owner"], vehicle: ["Van"], location: ["Main St"], weapon: ["Crowbar"] },
    status: "cold"
  }
];

export const mockLinkages: Linkage[] = [
  {
    id: "L-001",
    caseA: mockCases[0],
    caseB: mockCases[1],
    confidence: 85,
    signals: { semantic: 0.8, entity: 0.6, temporal: 0.9, mo: 0.9 },
    evidence: ["Both near water", "Both ambush", "Similar blunt force"],
    criticFlags: [],
    summary: "Strong MO and locational similarities.",
    investigatorStatus: "confirmed"
  },
  {
    id: "L-002",
    caseA: mockCases[1],
    caseB: mockCases[2],
    confidence: 90,
    signals: { semantic: 0.85, entity: 0.5, temporal: 0.8, mo: 0.95 },
    evidence: ["Water proximity", "Hidden attacker", "Similar time of day"],
    criticFlags: [],
    summary: "Clear continuation of pattern.",
    investigatorStatus: "confirmed"
  },
  {
    id: "L-003",
    caseA: mockCases[0],
    caseB: mockCases[3],
    confidence: 20,
    signals: { semantic: 0.2, entity: 0.1, temporal: 0.3, mo: 0.1 },
    evidence: ["Both at night"],
    criticFlags: [{ type: 'info', message: 'Weak linkage' }],
    summary: "Unlikely related.",
    investigatorStatus: "rejected"
  }
];
