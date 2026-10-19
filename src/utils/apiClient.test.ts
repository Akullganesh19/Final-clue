import test, { mock } from 'node:test';
import assert from 'node:assert';

test('ApiClient Interceptor', async (t) => {
    await t.test('Bypasses cache for no-cache headers', async () => {
        const mockResponse = new Response('ok', { status: 200 });
        const mockFetch = mock.fn(async () => mockResponse.clone());
        (globalThis.fetch as any) = mockFetch;

        // @ts-ignore dynamic import for test isolation
        const { setupGlobalFetchInterceptor } = await import('./apiClient.ts?1');
        setupGlobalFetchInterceptor();

        const res = await fetch('http://example.com', { cache: 'no-cache' });
        assert.equal(await res.text(), 'ok');
        assert.equal(mockFetch.mock.callCount(), 1);
    });

    await t.test('Coalesces concurrent requests', async () => {
        let resolveRequest: (res: Response) => void;
        const fetchPromise = new Promise<Response>((r) => { resolveRequest = r; });

        const mockFetch = mock.fn(async () => fetchPromise.then(r => r.clone()));
        (globalThis.fetch as any) = mockFetch;

        // @ts-ignore dynamic import for test isolation
        const { setupGlobalFetchInterceptor } = await import('./apiClient.ts?2');
        setupGlobalFetchInterceptor();

        const req1 = fetch('http://example.com/coalesce');
        const req2 = fetch('http://example.com/coalesce');

        const mockResponse = new Response('ok', { status: 200 });
        resolveRequest!(mockResponse);

        const [res1, res2] = await Promise.all([req1, req2]);
        assert.equal(await res1.text(), 'ok');
        assert.equal(await res2.text(), 'ok');

        assert.equal(mockFetch.mock.callCount(), 1, 'Should only call native fetch once');
    });

    await t.test('Returns from cache on second request', async () => {
        const mockResponse = new Response('ok', { status: 200 });
        const mockFetch = mock.fn(async () => mockResponse.clone());
        (globalThis.fetch as any) = mockFetch;

        // @ts-ignore dynamic import for test isolation
        const { setupGlobalFetchInterceptor, apiCache } = await import('./apiClient.ts?3');
        apiCache.cache.clear(); // Reset cache
        setupGlobalFetchInterceptor();

        const res1 = await fetch('http://example.com/cache');
        assert.equal(await res1.text(), 'ok');

        const res2 = await fetch('http://example.com/cache');
        assert.equal(await res2.text(), 'ok');

        assert.equal(mockFetch.mock.callCount(), 1, 'Should return from cache without calling native fetch');
    });

    await t.test('Revalidates stale cache in background', async (t) => {
        mock.timers.enable({ apis: ['setTimeout', 'Date'] });

        const mockResponse1 = new Response('old', { status: 200 });
        const mockResponse2 = new Response('new', { status: 200 });

        let callCount = 0;
        const mockFetch = mock.fn(async () => {
            callCount++;
            return callCount === 1 ? mockResponse1.clone() : mockResponse2.clone();
        });
        (globalThis.fetch as any) = mockFetch;

        // @ts-ignore dynamic import for test isolation
        const { setupGlobalFetchInterceptor, apiCache } = await import('./apiClient.ts?4');
        apiCache.cache.clear();
        setupGlobalFetchInterceptor();

        // 1. Initial request
        const res1 = await fetch('http://example.com/stale');
        assert.equal(await res1.text(), 'old');
        assert.equal(mockFetch.mock.callCount(), 1);

        // Advance time by 50 seconds (TTL is 60s, stale after 48s)
        mock.timers.tick(50000);

        // 2. Second request should return stale cache but trigger revalidation
        const res2 = await fetch('http://example.com/stale');
        assert.equal(await res2.text(), 'old'); // Still gets old value

        // Wait for microtasks (the background fetch) to resolve
        await new Promise(resolve => setImmediate(resolve));

        assert.equal(mockFetch.mock.callCount(), 2, 'Should trigger background revalidation');

        // 3. Third request should get the newly cached value
        const res3 = await fetch('http://example.com/stale');
        assert.equal(await res3.text(), 'new');

        assert.equal(mockFetch.mock.callCount(), 2, 'Should get from cache again');

        mock.timers.reset();
    });
});
