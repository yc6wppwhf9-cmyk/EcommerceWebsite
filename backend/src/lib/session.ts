import crypto from 'crypto';

/**
 * Short fingerprint of the stored password hash, carried in the refresh token.
 * Changing or resetting the password changes it, so refresh tokens issued
 * before the change stop working.
 */
export function passwordStamp(passwordHash: string | null) {
  return crypto.createHash('sha256').update(passwordHash ?? '').digest('hex').slice(0, 16);
}
