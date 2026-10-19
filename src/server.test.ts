import test from 'node:test';
import assert from 'node:assert';

test('server should be imported without hanging', async () => {
  // We mock process.argv to ensure it doesn't try to start the server
  const originalArgv = process.argv;
  process.argv = ['node', 'test.ts'];

  const appModule = await import('../server.ts');
  const app = appModule.default;

  assert.ok(app);
  assert.strictEqual(typeof app.use, 'function');

  process.argv = originalArgv;
});
