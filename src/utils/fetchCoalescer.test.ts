import test from 'node:test';
import assert from 'node:assert';
import http from 'node:http';
import { setupFetchCoalescing } from './fetchCoalescer.js';

test('fetch coalescing deduplicates identical concurrent GET requests', async () => {
  setupFetchCoalescing();
  let reqCount = 0;

  const server = http.createServer((req, res) => {
    reqCount++;
    setTimeout(() => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ data: 'ok' }));
    }, 100);
  });

  await new Promise<void>((resolve) => {
    server.listen(0, () => resolve());
  });

  const port = (server.address() as any).port;
  const url = `http://localhost:${port}/data`;

  const p1 = fetch(url);
  const p2 = fetch(url);
  const p3 = fetch(url);

  const [r1, r2, r3] = await Promise.all([p1, p2, p3]);

  assert.strictEqual(reqCount, 1);
  assert.strictEqual(await r1.json().then((d: any) => d.data), 'ok');
  assert.strictEqual(await r2.json().then((d: any) => d.data), 'ok');
  assert.strictEqual(await r3.json().then((d: any) => d.data), 'ok');

  await new Promise<void>((resolve) => {
    server.close(() => resolve());
  });
});
