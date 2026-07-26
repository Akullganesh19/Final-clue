import test from 'node:test';
import assert from 'node:assert';
import http from 'node:http';

// Load our coalescer
import './fetchCoalescer';

test('Fetch coalescing', async (t) => {
  await t.test('coalesces identical requests', async () => {
    let requests = 0;
    const server = http.createServer((req, res) => {
      requests++;
      res.writeHead(200);
      res.end('ok');
    });

    await new Promise<void>((resolve) => server.listen(0, () => resolve()));
    const port = (server.address() as any).port;
    const url = `http://localhost:${port}/test`;

    const p1 = globalThis.fetch(url);
    const p2 = globalThis.fetch(url);
    const p3 = globalThis.fetch(url);

    const [r1, r2, r3] = await Promise.all([p1, p2, p3]);

    assert.strictEqual(requests, 1);
    assert.strictEqual(await r1.text(), 'ok');
    assert.strictEqual(await r2.text(), 'ok');
    assert.strictEqual(await r3.text(), 'ok');

    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  await t.test('skips coalescing if AbortSignal is present', async () => {
    let requests = 0;
    const server = http.createServer((req, res) => {
      requests++;
      res.writeHead(200);
      res.end('ok');
    });

    await new Promise<void>((resolve) => server.listen(0, () => resolve()));
    const port = (server.address() as any).port;
    const url = `http://localhost:${port}/test-abort`;

    const ac1 = new AbortController();
    const ac2 = new AbortController();

    const p1 = globalThis.fetch(url, { signal: ac1.signal });
    const p2 = globalThis.fetch(url, { signal: ac2.signal });

    await Promise.all([p1, p2]);

    assert.strictEqual(requests, 2);

    await new Promise<void>((resolve) => server.close(() => resolve()));
  });
});
