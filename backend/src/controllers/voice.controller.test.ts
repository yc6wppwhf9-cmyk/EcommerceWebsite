import assert from 'node:assert/strict';
import test from 'node:test';
import { config } from '../config/env';
import { vapiWebhook } from './voice.controller';

config.VAPI_WEBHOOK_SECRET = 'test-secret';

function fakeRes() {
  const res: any = { statusCode: 200, body: undefined };
  res.status = (code: number) => { res.statusCode = code; return res; };
  res.json = (body: unknown) => { res.body = body; return res; };
  return res;
}

const toolCall = (headers: Record<string, string>) => ({
  headers,
  body: { message: { type: 'tool-calls', toolCallList: [{ id: 'call_1', function: { name: 'not_a_tool', arguments: '{}' } }] } },
}) as any;

test('rejects requests without the shared secret', async () => {
  const res = fakeRes();
  await vapiWebhook(toolCall({}), res);
  assert.equal(res.statusCode, 401);
});

test('rejects a wrong secret', async () => {
  const res = fakeRes();
  await vapiWebhook(toolCall({ 'x-vapi-secret': 'wrong-secret' }), res);
  assert.equal(res.statusCode, 401);
});

test('answers tool calls in the results format Vapi expects (x-vapi-secret)', async () => {
  const res = fakeRes();
  await vapiWebhook(toolCall({ 'x-vapi-secret': 'test-secret' }), res);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { results: [{ toolCallId: 'call_1', result: 'Unknown tool: not_a_tool' }] });
});

test('accepts the secret as a Bearer token', async () => {
  const res = fakeRes();
  await vapiWebhook(toolCall({ authorization: 'Bearer test-secret' }), res);
  assert.equal(res.statusCode, 200);
});
