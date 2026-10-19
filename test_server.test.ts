import { test, after, before } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import app from './server.js';
import http from 'http';

let server: http.Server;

before(() => {
    server = app.listen(0); // Random port to avoid conflicts
});

test('health endpoint should return 200', async () => {
    const response = await request(server).get('/health');
    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.body.status, 'healthy');
});

test('analyze endpoint should return fallback if AI fails', async () => {
    const response = await request(server).get('/api/analyze/123');
    assert.strictEqual(response.status, 200);
    assert.ok(response.body.analysis.includes('Analysis unavailable at this time'));
});

after(() => {
    if (server) {
        server.close();
    }
});
