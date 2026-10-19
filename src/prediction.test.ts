import { test } from 'node:test';
import assert from 'node:assert';
import 'global-jsdom/register';
import { renderHook, act } from '@testing-library/react';
import { useLinkagePrediction } from './hooks/useLinkagePrediction';

test('useLinkagePrediction degrades gracefully and caches correct links', async (t) => {
  // Mock global fetch
  const originalFetch = global.fetch;

  await t.test('prefetches highly linked cases and updates cache', async () => {
    let fetchCalledFor = '';
    global.fetch = async (url: string) => {
      fetchCalledFor = url;
      return {
        ok: true,
        json: async () => ({ id: 'c2', title: 'Test Case' })
      } as Response;
    };

    const { result } = renderHook(() => useLinkagePrediction());

    const mockLinkages = [
      {
        id: 'l1',
        confidence: 85, // > 80, should prefetch
        caseA: { id: 'c1' },
        caseB: { id: 'c2' }
      }
    ] as any;

    await act(async () => {
      await result.current.prefetchLinkedCases(mockLinkages, 'c1');
    });

    assert.strictEqual(fetchCalledFor, '/api/cases/c2');
    assert.deepStrictEqual(result.current.cache['c2'], { id: 'c2', title: 'Test Case' });
  });

  await t.test('degrades gracefully on fetch failure without throwing', async () => {
    global.fetch = async () => {
      throw new Error('Network error');
    };

    const { result } = renderHook(() => useLinkagePrediction());

    const mockLinkages = [
      {
        id: 'l2',
        confidence: 90,
        caseA: { id: 'c1' },
        caseB: { id: 'c3' }
      }
    ] as any;

    // Should not throw
    await act(async () => {
      await result.current.prefetchLinkedCases(mockLinkages, 'c1');
    });

    // Cache should remain empty
    assert.strictEqual(result.current.cache['c3'], undefined);
  });

  await t.test('ignores low confidence linkages', async () => {
    let fetchCalled = false;
    global.fetch = async () => {
      fetchCalled = true;
      return {} as Response;
    };

    const { result } = renderHook(() => useLinkagePrediction());

    const mockLinkages = [
      {
        id: 'l3',
        confidence: 70, // <= 80, should ignore
        caseA: { id: 'c1' },
        caseB: { id: 'c4' }
      }
    ] as any;

    await act(async () => {
      await result.current.prefetchLinkedCases(mockLinkages, 'c1');
    });

    assert.strictEqual(fetchCalled, false);
    assert.strictEqual(result.current.cache['c4'], undefined);
  });

  // Restore fetch
  global.fetch = originalFetch;
});