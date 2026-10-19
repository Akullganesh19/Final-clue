import { describe, it } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import { app } from '../server.js';

describe('Server API Endpoints', () => {
  it('GET /api/cases should return a list of cases', async () => {
    const response = await request(app).get('/api/cases');
    assert.strictEqual(response.status, 200);
    assert.strictEqual(Array.isArray(response.body), true);
    assert.strictEqual(response.body.length > 0, true);
    assert.strictEqual(response.body[0].id, '1');
  });

  it('GET /api/cases/:id/linkages should return linkages for a specific case', async () => {
    const response = await request(app).get('/api/cases/1/linkages');
    assert.strictEqual(response.status, 200);
    assert.strictEqual(Array.isArray(response.body), true);
    assert.strictEqual(response.body.length > 0, true);
    assert.strictEqual(response.body[0].confidence, 85);
  });

  it('GET /api/cases/:id/linkages should return empty array for non-existent linkages', async () => {
    const response = await request(app).get('/api/cases/999/linkages');
    assert.strictEqual(response.status, 200);
    assert.strictEqual(Array.isArray(response.body), true);
    assert.strictEqual(response.body.length, 0);
  });
});
