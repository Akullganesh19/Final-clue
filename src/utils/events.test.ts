import { test, mock } from 'node:test';
import assert from 'node:assert';
import { eventBus } from './events.ts';

test('EventBus allows publish and subscribe', () => {
    let receivedPayload = null;
    const callback = (payload: any) => { receivedPayload = payload; };
    eventBus.on('test-event', callback);
    eventBus.emit('test-event', { data: 'test' });
    assert.deepStrictEqual(receivedPayload, { data: 'test' });
    eventBus.off('test-event', callback);
});
