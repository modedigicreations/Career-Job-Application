import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  hashPassword,
  verifyPassword,
  isHashedPassword,
  createSessionToken,
  verifySessionToken
} from '@/lib/auth-server';
import { getInitialDbState } from '@/lib/db';

describe('Auth & Sync Security Test Suite', () => {
  it('hashPassword and verifyPassword should correctly hash and verify passwords', async () => {
    const raw = 'modeSuperSecret123';
    const hashed = await hashPassword(raw);

    assert.notStrictEqual(hashed, raw);
    assert.strictEqual(isHashedPassword(hashed), true);
    assert.strictEqual(isHashedPassword('plaintext_password'), false);

    const matches = await verifyPassword(raw, hashed);
    assert.strictEqual(matches, true);

    const wrong = await verifyPassword('wrongpassword', hashed);
    assert.strictEqual(wrong, false);
  });

  it('createSessionToken and verifySessionToken should sign and verify JWT tokens', () => {
    const userId = 'u1';
    const token = createSessionToken(userId);
    assert.ok(typeof token === 'string' && token.length > 20);

    const decoded = verifySessionToken(token);
    assert.ok(decoded);
    assert.strictEqual(decoded.userId, userId);

    // Invalid tokens should safely return null
    assert.strictEqual(verifySessionToken('tampered.or.invalid.token'), null);
  });

  it('getInitialDbState should initialize all expected entity collections', () => {
    const state = getInitialDbState();

    assert.ok(Array.isArray(state.users) && state.users.length > 0);
    assert.ok(Array.isArray(state.leads) && state.leads.length > 0);
    assert.ok(Array.isArray(state.tickets) && state.tickets.length > 0);
    assert.ok(Array.isArray(state.hostingAccounts) && state.hostingAccounts.length > 0);
    assert.ok(Array.isArray(state.invoices) && state.invoices.length > 0);
    assert.ok(Array.isArray(state.projects) && state.projects.length > 0);
    assert.ok(Array.isArray(state.requisitions) && state.requisitions.length > 0);
    assert.ok(Array.isArray(state.payrollRecords) && state.payrollRecords.length > 0);
  });
});
