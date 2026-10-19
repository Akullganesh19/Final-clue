import test from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import app, { dummyLinkages } from './server.ts';

test('GET /api/export/linkages/csv exports confirmed linkages as CSV', async () => {
  const response = await request(app).get('/api/export/linkages/csv');

  assert.strictEqual(response.status, 200);
  assert.strictEqual(response.headers['content-type'], 'text/csv; charset=utf-8');
  assert.ok(response.headers['content-disposition'].includes('attachment; filename="confirmed_linkages.csv"'));

  const text = response.text;
  const lines = text.split('\n');

  // Check header
  assert.strictEqual(lines[0], 'Linkage ID,Confidence,Case A ID,Case A Title,Case B ID,Case B Title,Summary,Status');

  // Check that only confirmed linkages are present
  const confirmedLinkagesCount = dummyLinkages.filter(l => l.investigatorStatus === 'confirmed').length;
  // +1 for header
  assert.strictEqual(lines.length, confirmedLinkagesCount + 1);

  // Check first data row (assuming we know the dummy data structure)
  if (confirmedLinkagesCount > 0) {
    const firstConfirmed = dummyLinkages.find(l => l.investigatorStatus === 'confirmed');
    assert.ok(lines[1].startsWith(`${firstConfirmed?.id},${firstConfirmed?.confidence}`));
    assert.ok(lines[1].includes('confirmed'));
  }
});
