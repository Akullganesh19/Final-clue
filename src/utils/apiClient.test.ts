import { test, describe, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert';
import { safeFetch, __clearIdempotencyCacheForTests, generateOperationId } from './apiClient';

describe('Self-Healing API Client', () => {
    let originalFetch: typeof globalThis.fetch;

    beforeEach(() => {
        originalFetch = globalThis.fetch;
        __clearIdempotencyCacheForTests();
        mock.restoreAll();
    });

    afterEach(() => {
        globalThis.fetch = originalFetch;
        __clearIdempotencyCacheForTests();
    });

    test('should retry idempotent operations on network failure and eventually succeed', async () => {
        let attempts = 0;
        const mockFetch = mock.fn(async () => {
            attempts++;
            if (attempts < 3) {
                throw new Error('Network failure');
            }
            return new Response('success', { status: 200 });
        });

        globalThis.fetch = mockFetch as any;

        const response = await safeFetch('https://api.example.com/data', { method: 'GET', maxRetries: 3, baseDelayMs: 1 });

        assert.strictEqual(response.status, 200);
        assert.strictEqual(attempts, 3);
        assert.strictEqual(mockFetch.mock.callCount(), 3);
    });

    test('should NOT retry non-idempotent operations', async () => {
        const mockFetch = mock.fn(async () => {
            throw new Error('Network failure');
        });

        globalThis.fetch = mockFetch as any;

        try {
            await safeFetch('https://api.example.com/data', { method: 'POST', maxRetries: 3, baseDelayMs: 1 });
            assert.fail('Expected safeFetch to throw');
        } catch (err: any) {
            assert.match(err.message, /Network failure/);
            assert.strictEqual(mockFetch.mock.callCount(), 1); // Only one attempt
        }
    });

    test('should fail if all retries are exhausted for idempotent operations', async () => {
        const mockFetch = mock.fn(async () => {
            throw new Error('Persistent network failure');
        });

        globalThis.fetch = mockFetch as any;

        try {
            await safeFetch('https://api.example.com/data', { maxRetries: 2, baseDelayMs: 1 });
            assert.fail('Expected safeFetch to throw');
        } catch (err: any) {
            assert.match(err.message, /Persistent network failure/);
            assert.strictEqual(mockFetch.mock.callCount(), 2);
        }
    });

    test('should prevent double execution for non-idempotent operations via client-side cache', async () => {
        const mockFetch = mock.fn(async () => {
             // Simulate network latency so second request comes in before first finishes
             await new Promise(resolve => setTimeout(resolve, 50));
             return new Response('created', { status: 201 });
        });

        globalThis.fetch = mockFetch as any;

        const requestOptions = {
            method: 'POST',
            body: JSON.stringify({ data: 'test' })
        };

        // Fire two requests concurrently
        const results = await Promise.allSettled([
            safeFetch('https://api.example.com/create', requestOptions),
            safeFetch('https://api.example.com/create', requestOptions)
        ]);

        const [req1, req2] = results;

        assert.strictEqual(req1.status, 'fulfilled');
        assert.strictEqual(req2.status, 'rejected');

        if (req2.status === 'rejected') {
            assert.match(req2.reason.message, /Idempotency conflict/);
        }

        assert.strictEqual(mockFetch.mock.callCount(), 1); // Ensure only one underlying fetch happened
    });

    test('should send Idempotency-Key header for non-idempotent operations', async () => {
        let capturedHeaders: Headers | undefined;
        const mockFetch = mock.fn(async (url: string, options?: RequestInit) => {
             capturedHeaders = options?.headers as Headers;
             return new Response('created', { status: 201 });
        });

        globalThis.fetch = mockFetch as any;

        const requestOptions = {
            method: 'POST',
            body: JSON.stringify({ data: 'test' })
        };

        await safeFetch('https://api.example.com/create', requestOptions);

        assert.ok(capturedHeaders);
        assert.ok(capturedHeaders.has('Idempotency-Key'));
        const key = capturedHeaders.get('Idempotency-Key');
        assert.strictEqual(key?.length, 64); // 64 char hex string
        assert.match(key!, /^[0-9a-f]{64}$/);
    });

    test('generateOperationId produces consistent 64-char hex strings for the same input', async () => {
        const id1 = await generateOperationId('POST', 'https://example.com/api', '{"key":"value"}');
        const id2 = await generateOperationId('POST', 'https://example.com/api', '{"key":"value"}');

        assert.strictEqual(id1, id2);
        assert.strictEqual(id1.length, 64);
        assert.match(id1, /^[0-9a-f]{64}$/);
    });
});
