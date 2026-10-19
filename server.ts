import express from 'express';
import { Case } from './src/types';
import dotenv from 'dotenv';

dotenv.config();

export const app = express();
app.use(express.json());

// Mock Data
export const mockCases: Case[] = [
  {
    id: 'C-001',
    title: 'The Midnight Ghost',
    date: '2023-10-31',
    location: 'Elm Street, Springfield',
    narrative: 'A suspect broke in and stole valuable artifacts.',
    moDescription: 'Forced entry through the backdoor, cut power.',
    moCategories: ['Burglary', 'Nighttime', 'Power Sabotage'],
    entities: {
      person: ['John Doe'],
      vehicle: ['Black SUV'],
      location: ['Elm Street Museum'],
      weapon: ['Crowbar']
    },
    status: 'cold'
  },
  {
    id: 'C-002',
    title: 'The Phantom Menace',
    date: '2022-05-15',
    location: 'Oak Avenue, Shelbyville',
    narrative: 'A quiet robbery without any traces.',
    moDescription: 'No sign of forced entry.',
    moCategories: ['Burglary'],
    entities: {
      person: [],
      vehicle: [],
      location: ['Oak Avenue Bank'],
      weapon: []
    },
    status: 'cold'
  },
    {
    id: 'C-003',
    title: 'The Silent Observer',
    date: '2021-11-10',
    location: 'Pine Street, Capital City',
    narrative: 'A complex web of clues left at the scene.',
    moDescription: 'Victim found with multiple items missing. Signs of struggle. Left a cryptic note.',
    moCategories: ['Robbery', 'Cryptic Message', 'Struggle'],
    entities: {
      person: ['Jane Smith', 'Mystery Man'],
      vehicle: ['Red Sedan'],
      location: ['Pine Street Apartment'],
      weapon: ['Rope', 'Knife']
    },
    status: 'open',
    evidenceDocUrl: 'http://example.com/evidence-c003.pdf'
  }
];


// Solvability Scoring Logic
export function calculateSolvability(c: Case) {
    let score = 0;
    const reasons: string[] = [];

    // Entities
    let entityCount = 0;
    Object.values(c.entities).forEach(arr => entityCount += arr.length);
    if (entityCount > 3) {
        score += 30;
        reasons.push(`Rich entity data (${entityCount} entities found)`);
    } else if (entityCount > 0) {
        score += 10;
        reasons.push(`Some entity data (${entityCount} entities found)`);
    } else {
        reasons.push(`No entities identified`);
    }

    // MO Categories
    if (c.moCategories.length > 2) {
        score += 40;
        reasons.push(`Detailed MO profile (${c.moCategories.length} categories)`);
    } else if (c.moCategories.length > 0) {
        score += 20;
        reasons.push(`Basic MO profile (${c.moCategories.length} categories)`);
    } else {
        reasons.push(`No MO patterns identified`);
    }

    // Evidence
    if (c.evidenceDocUrl) {
        score += 30;
        reasons.push(`External evidence document linked`);
    }

    // Notes
    if(c.notes && c.notes.length > 10) {
        score += 10;
        reasons.push('Contains additional investigator notes');
    }

    // Cap score at 100
    score = Math.min(score, 100);

    return {
        caseId: c.id,
        title: c.title,
        status: c.status,
        date: c.date,
        score,
        reasons,
        moCategories: c.moCategories,
        entityCount
    };
}


// Endpoint
app.get('/api/cases/solvability', (req, res) => {
    const scoredCases = mockCases.map(calculateSolvability);
    scoredCases.sort((a, b) => b.score - a.score); // Highest first
    res.json({ cases: scoredCases });
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});


// Conditionally start server for testing
if (process.argv[1]?.includes('server.ts') || process.argv[1]?.includes('server.cjs')) {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Server listening on port ${port}`);
    });
}
