import test from 'node:test';
import assert from 'node:assert';
import { withRetry, CircuitBreaker, sleep } from './resilience';

test('withRetry - success on first try', async () => {
    let attempts = 0;
    const fn = async () => {
        attempts++;
        return "success";
    };

    const result = await withRetry(fn);
    assert.strictEqual(result, "success");
    assert.strictEqual(attempts, 1);
});

test('withRetry - success after retries', async () => {
    let attempts = 0;
    const fn = async () => {
        attempts++;
        if (attempts < 3) throw new Error("Transient error");
        return "success";
    };

    const result = await withRetry(fn, { maxAttempts: 3, baseDelayMs: 10 });
    assert.strictEqual(result, "success");
    assert.strictEqual(attempts, 3);
});

test('withRetry - throws after max attempts', async () => {
    let attempts = 0;
    const fn = async () => {
        attempts++;
        throw new Error("Persistent error");
    };

    try {
        await withRetry(fn, { maxAttempts: 3, baseDelayMs: 10 });
        assert.fail("Should have thrown");
    } catch (err: any) {
        assert.strictEqual(err.message, "Persistent error");
        assert.strictEqual(attempts, 3);
    }
});

test('withRetry - refuses to retry non-idempotent operations', async () => {
    let attempts = 0;
    const fn = async () => {
        attempts++;
        throw new Error("Error");
    };

    try {
        await withRetry(fn, { isIdempotent: false, maxAttempts: 3 });
        assert.fail("Should have thrown");
    } catch (err: any) {
        assert.strictEqual(err.message, "Error");
        assert.strictEqual(attempts, 1); // Only tried once!
    }
});

test('CircuitBreaker - opens and closes correctly', async () => {
    const cb = new CircuitBreaker(2, 50); // 2 failures, 50ms cooldown

    let attempts = 0;
    const failingFn = async () => {
        attempts++;
        throw new Error("Failed");
    };

    // Attempt 1: Fails, but CB is CLOSED
    try { await cb.execute(failingFn); } catch (e) {}
    assert.strictEqual(attempts, 1);

    // Attempt 2: Fails, CB transitions to OPEN
    try { await cb.execute(failingFn); } catch (e) {}
    assert.strictEqual(attempts, 2);

    // Attempt 3: CB is OPEN, should fast-fail without calling fn
    try { await cb.execute(failingFn); } catch (e: any) {
        assert.strictEqual(e.message, "Circuit breaker is OPEN");
    }
    assert.strictEqual(attempts, 2); // Function not called again!

    // Wait for cooldown
    await sleep(60);

    // Attempt 4: CB is HALF_OPEN, allows one request
    const recoveringFn = async () => {
        attempts++;
        return "recovered";
    };

    const result = await cb.execute(recoveringFn);
    assert.strictEqual(result, "recovered");
    assert.strictEqual(attempts, 3);

    // Attempt 5: CB is CLOSED again, allows normal requests
    const result2 = await cb.execute(recoveringFn);
    assert.strictEqual(result2, "recovered");
    assert.strictEqual(attempts, 4);
});

test('CircuitBreaker - fallback function', async () => {
    const cb = new CircuitBreaker(1, 1000);
    const failingFn = async () => { throw new Error("Failed"); };
    const fallbackFn = async () => "fallback data";

    // Attempt 1: Fails, returns fallback
    const result1 = await cb.execute(failingFn, fallbackFn);
    assert.strictEqual(result1, "fallback data");

    // Attempt 2: CB is OPEN, fast-fails and returns fallback
    const result2 = await cb.execute(failingFn, fallbackFn);
    assert.strictEqual(result2, "fallback data");
});
