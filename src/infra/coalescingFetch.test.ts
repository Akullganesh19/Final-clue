import test from 'node:test';
import assert from 'node:assert';
import './coalescingFetch';

test('coalesces multiple concurrent GET requests without AbortSignal', async () => {
  let callCount = 0;

  // We need to mock the interceptor's underlying originalFetch.
  // The interceptor wraps globalThis.fetch. So let's wrap it again, but wait -
  // actually, since we already imported it, we can't easily mock its internal `originalFetch`.
  // Let's create a temporary HTTP server to test real requests!

  const http = await import('http');
  const server = http.createServer((req, res) => {
    callCount++;
    res.writeHead(200);
    res.end('ok');
  });

  await new Promise(resolve => server.listen(0, resolve));
  const port = (server.address() as any).port;

  const p1 = fetch(`http://localhost:${port}/api/data`);
  const p2 = fetch(`http://localhost:${port}/api/data`);
  await Promise.all([p1, p2]);

  assert.strictEqual(callCount, 1);

  server.close();
});

test('does not coalesce requests with AbortSignal', async () => {
  let callCount = 0;

  const http = await import('http');
  const server = http.createServer((req, res) => {
    callCount++;
    res.writeHead(200);
    res.end('ok');
  });

  await new Promise(resolve => server.listen(0, resolve));
  const port = (server.address() as any).port;

  const controller = new AbortController();
  const p1 = fetch(`http://localhost:${port}/api/other`, { signal: controller.signal });
  const p2 = fetch(`http://localhost:${port}/api/other`, { signal: controller.signal });
  await Promise.all([p1, p2]);

  assert.strictEqual(callCount, 2);

  server.close();
});
