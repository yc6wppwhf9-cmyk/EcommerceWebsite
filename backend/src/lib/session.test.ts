import assert from 'node:assert/strict';
import test from 'node:test';
import { passwordStamp } from './session';
import { changePasswordSchema } from '../types/schemas';

test('a new password hash gives a different stamp, invalidating old refresh tokens', () => {
  assert.notEqual(passwordStamp('$2a$12$old-hash'), passwordStamp('$2a$12$new-hash'));
});

test('the stamp is stable for the same hash', () => {
  assert.equal(passwordStamp('$2a$12$same'), passwordStamp('$2a$12$same'));
});

test('change-password rejects new passwords shorter than 8 characters', () => {
  const result = changePasswordSchema.safeParse({ body: { currentPassword: 'old-pass', newPassword: 'short' } });
  assert.equal(result.success, false);
});

test('change-password accepts a valid request', () => {
  const result = changePasswordSchema.safeParse({ body: { currentPassword: 'old-pass', newPassword: 'long-enough-1' } });
  assert.equal(result.success, true);
});
