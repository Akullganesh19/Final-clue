import test from 'node:test';
import assert from 'node:assert';
import http from 'node:http';
import './coalesceFetch';

test('Request coalescing groups concurrent requests to the same URL', async (t) => {
  let requestCount = 0;

  const server = http.createServer((req, res) => {
    requestCount++;
    setTimeout(() => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, count: requestCount }));
    }, 100);
  });

  await new Promise<void>((resolve) => {
    server.listen(0, () => resolve());
  });

  const address = server.address() as import('net').AddressInfo;
  const url = `http://localhost:${address.port}/data`;

  // Make 5 concurrent requests
  const promises = [];
  for (let i = 0; i < 5; i++) {
    promises.push(fetch(url).then(res => res.json()));
  }

  const results = await Promise.all(promises);

  // Assert only one network request was made
  assert.strictEqual(requestCount, 1, 'Only one actual network request should have been made');

  // Assert all responses are identical
  for (const result of results) {
    assert.deepStrictEqual(result, { success: true, count: 1 });
  }

  // Cleanup
  server.close();
});

test('Request coalescing degrades gracefully with AbortSignal', async (t) => {
  let requestCount = 0;

  const server = http.createServer((req, res) => {
    requestCount++;
    setTimeout(() => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, count: requestCount }));
    }, 100);
  });

  await new Promise<void>((resolve) => {
    server.listen(0, () => resolve());
  });

  const address = server.address() as import('net').AddressInfo;
  const url = `http://localhost:${address.port}/signal-data`;

  // Make 2 concurrent requests, one with AbortSignal
  const controller = new AbortController();

  const promises = [
    fetch(url).then(res => res.json()),
    fetch(url, { signal: controller.signal }).then(res => res.json())
  ];

  const results = await Promise.all(promises);

  // Since one has an AbortSignal, they should not be coalesced, resulting in 2 network requests
  assert.strictEqual(requestCount, 2, 'Two network requests should be made because one has AbortSignal');

  // Cleanup
  server.close();
});
