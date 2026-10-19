import test from 'node:test';
import assert from 'node:assert';

test('Prediction engine API degrades gracefully when case not found', async () => {
  const app = (await import('./server.ts')).default;
  const req = { body: { currentCaseId: 'UNKNOWN' } };
  let jsonResponse: any;
  const res = {
    json: (data: any) => { jsonResponse = data; }
  };

  const route = (app as any)._router.stack.find((r: any) => r.route && r.route.path === '/api/predict-next-case');
  if (route) {
    const handler = route.route.stack[0].handle;
    handler(req, res, () => {});
    assert.strictEqual(jsonResponse.predictedCaseId, null);
  } else {
    assert.fail('Route not found');
  }
});
