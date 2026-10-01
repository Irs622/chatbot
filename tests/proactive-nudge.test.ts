/**
 * INPARTNER AI — Proactive Engagement Triggers & Exit-Intent Test Suite
 * PT Inpartner Optima Integra • Behavioral Prospect Nudges
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { PROACTIVE_TRIGGER_CONFIG } from '../lib/config.ts';
import {
  canShowProactiveNudge,
  markNudgeDismissed,
  markNudgeShown,
  recordVisitorSession,
  getNudgeMessage,
  NUDGE_STORAGE_KEYS
} from '../lib/proactiveNudge.ts';
import type { NudgeTriggerType } from '../lib/proactiveNudge.ts';

// Mock Storage Implementation for Node.js test environment
class MockStorage implements Storage {
  private store: Map<string, string> = new Map();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] || null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
}

describe('1. Proactive Trigger Configuration & Thresholds', () => {
  test('should provide valid defaults conforming to enterprise advisory specifications', () => {
    assert.equal(PROACTIVE_TRIGGER_CONFIG.enabled, true);
    assert.equal(PROACTIVE_TRIGGER_CONFIG.dwellTimeSeconds, 25);
    assert.equal(PROACTIVE_TRIGGER_CONFIG.returnVisitorDwellSeconds, 10);
    assert.equal(PROACTIVE_TRIGGER_CONFIG.exitIntentEnabled, true);
    assert.equal(PROACTIVE_TRIGGER_CONFIG.frequencyCapPerSession, 1);
  });
});

describe('2. Governance & Session Frequency Capping Rules', () => {
  test('should allow nudge when widget is closed and no prior session nudge was shown', () => {
    const mockSession = new MockStorage();

    const allowed = canShowProactiveNudge({
      isOpen: false,
      hasInteracted: false,
      sessionStorage: mockSession
    });

    assert.equal(allowed, true);
  });

  test('should prevent nudge when widget is already open or user has interacted', () => {
    const mockSession = new MockStorage();

    // Widget is open
    assert.equal(
      canShowProactiveNudge({
        isOpen: true,
        hasInteracted: false,
        sessionStorage: mockSession
      }),
      false
    );

    // User already interacted
    assert.equal(
      canShowProactiveNudge({
        isOpen: false,
        hasInteracted: true,
        sessionStorage: mockSession
      }),
      false
    );
  });

  test('should strictly enforce frequency capping once nudge is marked shown', () => {
    const mockSession = new MockStorage();

    assert.equal(canShowProactiveNudge({ isOpen: false, sessionStorage: mockSession }), true);

    markNudgeShown(mockSession);
    assert.equal(mockSession.getItem(NUDGE_STORAGE_KEYS.SESSION_SHOWN), 'true');

    // Should no longer allow nudge in the same session
    assert.equal(canShowProactiveNudge({ isOpen: false, sessionStorage: mockSession }), false);
  });

  test('should prevent nudge from ever re-appearing once dismissed by visitor', () => {
    const mockSession = new MockStorage();

    markNudgeDismissed(mockSession);
    assert.equal(mockSession.getItem(NUDGE_STORAGE_KEYS.SESSION_DISMISSED), 'true');

    assert.equal(canShowProactiveNudge({ isOpen: false, sessionStorage: mockSession }), false);
  });
});

describe('3. Return Visitor Recognition Engine', () => {
  test('should identify first-time visitors and initialize profile', () => {
    const mockLocal = new MockStorage();

    const session1 = recordVisitorSession(mockLocal);
    assert.equal(session1.visitCount, 1);
    assert.equal(session1.isReturning, false);
    assert.ok(mockLocal.getItem(NUDGE_STORAGE_KEYS.VISITOR_PROFILE));
  });

  test('should recognize returning visitors on subsequent visits', () => {
    const mockLocal = new MockStorage();

    // Visit 1
    recordVisitorSession(mockLocal);

    // Visit 2
    const session2 = recordVisitorSession(mockLocal);
    assert.equal(session2.visitCount, 2);
    assert.equal(session2.isReturning, true);

    // Visit 3
    const session3 = recordVisitorSession(mockLocal);
    assert.equal(session3.visitCount, 3);
    assert.equal(session3.isReturning, true);
  });
});

describe('4. Trilingual Nudge Messaging Synthesis', () => {
  const triggers: NudgeTriggerType[] = ['dwell_time', 'exit_intent', 'return_visitor'];

  test('should provide comprehensive localized messages for ID, EN, and KO', () => {
    for (const trigger of triggers) {
      const msgId = getNudgeMessage(trigger, 'id');
      assert.ok(msgId.title.length > 0);
      assert.ok(msgId.body.length > 0);
      assert.ok(msgId.cta.length > 0);

      const msgEn = getNudgeMessage(trigger, 'en');
      assert.ok(msgEn.title.length > 0);
      assert.ok(msgEn.body.length > 0);
      assert.ok(msgEn.cta.length > 0);

      const msgKo = getNudgeMessage(trigger, 'ko');
      assert.ok(msgKo.title.length > 0);
      assert.ok(msgKo.body.length > 0);
      assert.ok(msgKo.cta.length > 0);
    }
  });

  test('Dwell Time message matches executive consultative advisory specification', () => {
    const dwellEn = getNudgeMessage('dwell_time', 'en');
    assert.ok(dwellEn.body.includes('strategic corporate options'));
    assert.ok(dwellEn.body.includes('market expansion plans'));

    const dwellId = getNudgeMessage('dwell_time', 'id');
    assert.ok(dwellId.body.includes('opsi strategis korporat'));
    assert.ok(dwellId.body.includes('rencana ekspansi pasar'));
  });

  test('Exit Intent message encourages brief consultation prior to exit', () => {
    const exitEn = getNudgeMessage('exit_intent', 'en');
    assert.ok(exitEn.badge.includes('Before You Go'));
    assert.ok(exitEn.cta.includes('2-Minute'));

    const exitId = getNudgeMessage('exit_intent', 'id');
    assert.ok(exitId.badge.includes('Sebelum Anda Pergi'));
  });

  test('Return Visitor message acknowledges previous visit', () => {
    const retId = getNudgeMessage('return_visitor', 'id');
    assert.ok(retId.badge.includes('Selamat Datang Kembali'));
    assert.ok(retId.body.includes('diagnostic assessment'));

    const retKo = getNudgeMessage('return_visitor', 'ko');
    assert.ok(retKo.badge.includes('다시'));
  });
});
