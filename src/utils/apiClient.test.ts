import { test } from 'node:test';
import * as assert from 'node:assert';
import { dedupedFetch } from './apiClient.js';
import http from 'http';

test('dedupedFetch coalescing', async () => {
  let requestCount = 0;

  const server = http.createServer((req, res) => {
    requestCount++;
    // Add artificial delay to ensure coalescing window is open
    setTimeout(() => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ hello: 'world', count: requestCount }));
    }, 50);
  });

  await new Promise<void>((resolve) => server.listen(0, () => resolve()));
  const port = (server.address() as any).port;
  const url = `http://localhost:${port}/test`;

  // 1. Test Request Coalescing
  const req1 = dedupedFetch(url, { headers: { 'Authorization': 'Bearer 1' } });
  const req2 = dedupedFetch(url, { headers: { 'Authorization': 'Bearer 1' } });

  const [res1, res2] = await Promise.all([req1, req2]);
  const body1 = await res1.json();
  const body2 = await res2.json();

  assert.deepStrictEqual(body1, { hello: 'world', count: 1 });
  assert.deepStrictEqual(body2, { hello: 'world', count: 1 });
  assert.strictEqual(requestCount, 1, 'Should coalesce concurrent requests');

  // 2. Test sequential requests are NOT cached
  const req3 = await dedupedFetch(url, { headers: { 'Authorization': 'Bearer 1' } });
  const body3 = await req3.json();
  assert.deepStrictEqual(body3, { hello: 'world', count: 2 });
  assert.strictEqual(requestCount, 2, 'Sequential requests should hit server');

  // 3. Test Non-GET methods are not coalesced
  const reqPost1 = await dedupedFetch(url, { method: 'POST', body: 'test1' });
  const reqPost2 = await dedupedFetch(url, { method: 'POST', body: 'test2' });
  const bodyPost1 = await reqPost1.json();
  const bodyPost2 = await reqPost2.json();

  assert.strictEqual(requestCount, 4, 'POST requests should hit server individually');

  server.close();
});
