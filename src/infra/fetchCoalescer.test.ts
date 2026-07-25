import { test } from 'node:test';
import assert from 'node:assert';
import http from 'node:http';
import { setupFetchCoalescer } from './fetchCoalescer';

setupFetchCoalescer();

test('coalesces multiple fetch requests to the same URL', async () => {
  let requestCount = 0;

  const server = http.createServer((req, res) => {
    requestCount++;
    setTimeout(() => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ data: 'success' }));
    }, 100);
  });

  await new Promise<void>((resolve) => {
    server.listen(0, () => resolve());
  });

  const address = server.address() as import('net').AddressInfo;
  const url = `http://localhost:${address.port}/data`;

  const promises = [
    fetch(url),
    fetch(url),
    fetch(url)
  ];

  const responses = await Promise.all(promises);

  assert.strictEqual(requestCount, 1, 'Only one actual HTTP request should be made');

  for (const response of responses) {
    assert.strictEqual(response.status, 200);
    const json = await response.json();
    assert.strictEqual(json.data, 'success');
  }

  server.close();
});
