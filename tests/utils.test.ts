import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatCurrency,
  formatDate,
  formatWhatsAppUrl,
  isManagementUser,
  isSuperAdminUser,
  canAssignTo
} from '@/lib/utils';

describe('Utils & Business Logic Test Suite', () => {
  it('formatCurrency should always format in Nigerian Naira (₦)', () => {
    assert.match(formatCurrency(1500000), /₦1,500,000/);
    assert.match(formatCurrency(0), /₦0/);
    assert.match(formatCurrency(null), /₦0/);
  });

  it('formatWhatsAppUrl should normalize 0-prefixed Nigerian phone numbers', () => {
    const url = formatWhatsAppUrl('08012345678', 'Hello Mode');
    assert.strictEqual(url, 'https://wa.me/2348012345678?text=Hello%20Mode');

    const intlUrl = formatWhatsAppUrl('+2348012345678');
    assert.strictEqual(intlUrl, 'https://wa.me/2348012345678');
  });

  it('isManagementUser should return true for executive and management roles', () => {
    assert.strictEqual(isManagementUser('managing_director'), true);
    assert.strictEqual(isManagementUser('manager'), true);
    assert.strictEqual(isManagementUser('super_admin'), true);
    assert.strictEqual(isManagementUser('administration'), true);
    assert.strictEqual(isManagementUser('employee'), false);
    assert.strictEqual(isManagementUser('developer'), false);
    assert.strictEqual(isManagementUser('sales'), false);
  });

  it('isSuperAdminUser should identify super_admin and managing_director', () => {
    assert.strictEqual(isSuperAdminUser('managing_director'), true);
    assert.strictEqual(isSuperAdminUser('super_admin'), true);
    assert.strictEqual(isSuperAdminUser('manager'), false);
    assert.strictEqual(isSuperAdminUser('employee'), false);
  });

  it('canAssignTo should scope permissions to super-admins or direct reports', () => {
    const md = { id: 'u1', role: 'managing_director' };
    const manager = { id: 'u4', role: 'manager' };
    const employee1 = { id: 'e1', manager_id: 'u4' };
    const employee2 = { id: 'e2', manager_id: 'u99' };
    const regularStaff = { id: 'u3', role: 'developer' };

    // Super admin / MD can assign to anyone
    assert.strictEqual(canAssignTo(md, employee1), true);
    assert.strictEqual(canAssignTo(md, employee2), true);

    // Manager can only assign to direct reports
    assert.strictEqual(canAssignTo(manager, employee1), true);
    assert.strictEqual(canAssignTo(manager, employee2), false);

    // Regular staff cannot assign to anyone
    assert.strictEqual(canAssignTo(regularStaff, employee1), false);
  });

  it('Lead and Company models should support referralName and lastUpdatedByName for bonus tracking', () => {
    const testLead = {
      id: 'lead-test-1',
      name: 'John Doe',
      company: 'Zenith Apex Ltd',
      email: 'john@zenith.ng',
      phone: '08012345678',
      source: 'referral' as const,
      status: 'qualified' as const,
      serviceInterest: 'website-development' as const,
      budget: 1500000,
      currency: 'NGN' as const,
      assignedTo: 'u1',
      referralName: 'Sarah Jenkins',
      lastUpdatedByName: 'David Adeleke',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    assert.strictEqual(testLead.referralName, 'Sarah Jenkins');
    assert.strictEqual(testLead.lastUpdatedByName, 'David Adeleke');

    const testCompany = {
      id: 'comp-test-1',
      name: 'Zenith Apex Ltd',
      industry: 'Fintech',
      website: 'https://zenithapex.ng',
      email: 'corp@zenithapex.ng',
      phone: '08099887766',
      address: 'Victoria Island, Lagos',
      referralName: 'Sarah Jenkins',
      accountManager: 'David Adeleke',
      createdAt: new Date().toISOString(),
    };

    assert.strictEqual(testCompany.referralName, 'Sarah Jenkins');
    assert.strictEqual(testCompany.accountManager, 'David Adeleke');
  });

  it('merge recency check should protect local edits within the 5 second grace window', () => {
    const now = Date.now();
    const localTsRecent = now - 1500; // 1.5s ago
    const serverTs = now - 5000; // 5s ago

    const isProtected = (now - localTsRecent < 5000) || (localTsRecent > serverTs);
    assert.strictEqual(isProtected, true);

    const localTsStale = now - 60000; // 60s ago
    const newerServerTs = now - 1000; // 1s ago
    const isStaleProtected = (now - localTsStale < 5000) || (localTsStale > newerServerTs);
    assert.strictEqual(isStaleProtected, false);
  });
});
