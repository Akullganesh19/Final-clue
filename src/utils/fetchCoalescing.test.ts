import { test, describe, mock, beforeEach } from 'node:test';
import assert from 'node:assert';

// We need to provide a dummy Request, Headers, etc., since we are running in Node
if (!globalThis.Headers) {
  class DummyHeaders {
    private map = new Map<string, string>();
    constructor(init?: Record<string, string>) {
      if (init) {
        for (const [k, v] of Object.entries(init)) {
          this.map.set(k.toLowerCase(), v);
        }
      }
    }
    forEach(cb: (value: string, key: string) => void) {
      this.map.forEach(cb);
    }
  }
  (globalThis as any).Headers = DummyHeaders;
}

if (!globalThis.Request) {
  class DummyRequest {
    url: string;
    method: string;
    headers: any;
    signal?: AbortSignal;
    constructor(url: string, init?: any) {
      this.url = url;
      this.method = init?.method || 'GET';
      this.headers = new (globalThis as any).Headers(init?.headers);
      this.signal = init?.signal;
    }
  }
  (globalThis as any).Request = DummyRequest;
}

describe('Fetch Request Coalescing', () => {
  let fetchCallCount = 0;

  beforeEach(() => {
    fetchCallCount = 0;
    const originalFetch = globalThis.fetch;
    // Mock global fetch to return a delayed response
    globalThis.fetch = async (input: any, init?: any) => {
      fetchCallCount++;
      return new Promise<Response>((resolve) => {
        setTimeout(() => {
          resolve({
            ok: true,
            status: 200,
            json: async () => ({ data: 'test' }),
            clone: function() { return this; }
          } as any as Response);
        }, 50);
      });
    };

    // Reload the coalescing module to apply our mock
    // We clear cache if necessary, or just rely on the fact that fetchCoalescing overrides globalThis.fetch
    // Wait, since Node caches requires, we should just override globalThis.fetch, and then load the module
  });

  test('deduplicates concurrent requests', async () => {
    fetchCallCount = 0;
    // Mock the base fetch
    const baseFetch = globalThis.fetch;

    // Require the module which will override fetch
    await import('./fetchCoalescing');

    // Make concurrent requests
    const p1 = fetch('https://api.example.com/data');
    const p2 = fetch('https://api.example.com/data');
    const p3 = fetch('https://api.example.com/data', { method: 'GET' });

    await Promise.all([p1, p2, p3]);

    // Should only have called the underlying fetch once
    assert.strictEqual(fetchCallCount, 1, 'Fetch should have been called exactly once');

    // Restore fetch to baseFetch to clean up
    globalThis.fetch = baseFetch;
  });

  test('bypasses coalescing for non-GET requests', async () => {
    fetchCallCount = 0;
    const baseFetch = globalThis.fetch;
    await import('./fetchCoalescing');

    const p1 = fetch('https://api.example.com/data', { method: 'POST' });
    const p2 = fetch('https://api.example.com/data', { method: 'POST' });

    await Promise.all([p1, p2]);

    assert.strictEqual(fetchCallCount, 2, 'POST requests should not be coalesced');
    globalThis.fetch = baseFetch;
  });

  test('bypasses coalescing if AbortSignal is present', async () => {
    fetchCallCount = 0;
    const baseFetch = globalThis.fetch;
    await import('./fetchCoalescing');

    const controller = new AbortController();

    const p1 = fetch('https://api.example.com/data', { signal: controller.signal });
    const p2 = fetch('https://api.example.com/data', { signal: controller.signal });

    await Promise.all([p1, p2]);

    assert.strictEqual(fetchCallCount, 2, 'Requests with AbortSignal should not be coalesced');
    globalThis.fetch = baseFetch;
  });
});
