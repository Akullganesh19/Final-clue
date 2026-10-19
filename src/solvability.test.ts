import test from 'node:test';
import assert from 'node:assert';
import { calculateSolvability, mockCases } from '../server';

test('Solvability Scoring Logic', async (t) => {

    await t.test('Case C-001 with rich data gets high score', () => {
        const case1 = mockCases.find(c => c.id === 'C-001');
        assert(case1);
        const result = calculateSolvability(case1);

        assert(result.score >= 70, `Expected high score, got ${result.score}`);
        assert.strictEqual(result.entityCount, 4);
        assert(result.reasons.some(r => r.includes('Rich entity data')));
    });

    await t.test('Case C-002 with missing data gets low score', () => {
        const case2 = mockCases.find(c => c.id === 'C-002');
        assert(case2);
        const result = calculateSolvability(case2);

        assert(result.score <= 30, `Expected low score, got ${result.score}`);
        assert.strictEqual(result.entityCount, 1); // Oak Avenue Bank
        assert(result.reasons.some(r => r.includes('Some entity data')));
    });

    await t.test('Case C-003 with max evidence cap', () => {
        const case3 = mockCases.find(c => c.id === 'C-003');
        assert(case3);
        const result = calculateSolvability(case3);

        assert.strictEqual(result.score, 100); // 30(entities) + 40(MO) + 30(evidenceDoc) = 100
        assert.strictEqual(result.entityCount, 6);
        assert(result.reasons.some(r => r.includes('External evidence document linked')));
    });

});
