import { test } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import app from '../server';

test('GET /api/health returns ok', async () => {
  const response = await request(app).get('/api/health');
  assert.strictEqual(response.status, 200);
  assert.deepStrictEqual(response.body, { status: 'ok' });
});
