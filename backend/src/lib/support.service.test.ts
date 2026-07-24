import assert from 'node:assert/strict';
import test from 'node:test';
import { generateTicketNumber } from './support.service';

test('warranty tickets use a readable dated reference', () => {
  const ticket = generateTicketNumber('warranty', new Date('2026-07-24T10:00:00.000Z'));
  assert.match(ticket, /^WR-20260724-[A-F0-9]{6}$/);
});

test('contact tickets use a separate prefix', () => {
  const ticket = generateTicketNumber('contact', new Date('2026-07-24T10:00:00.000Z'));
  assert.match(ticket, /^CS-20260724-[A-F0-9]{6}$/);
});
