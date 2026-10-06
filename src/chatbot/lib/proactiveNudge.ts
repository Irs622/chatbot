/**
 * INPARTNER AI — Proactive Advisory Engagement & Exit-Intent Telemetry Engine
 * PT Inpartner Optima Integra • Behavioral Prospect Nudges
 */

import { PROACTIVE_TRIGGER_CONFIG } from './config.ts';

export type NudgeTriggerType = 'dwell_time' | 'exit_intent' | 'return_visitor';

export const NUDGE_STORAGE_KEYS = {
  SESSION_SHOWN: 'inpartner_nudge_shown',
  SESSION_DISMISSED: 'inpartner_nudge_dismissed',
  VISITOR_PROFILE: 'inpartner_visitor_profile'
} as const;

export interface VisitorProfile {
  visitCount: number;
  firstVisit: string;
  lastVisit: string;
}

export interface NudgeEligibilityParams {
  isOpen: boolean;
  hasInteracted?: boolean;
  sessionStorage?: Storage | null;
  configEnabled?: boolean;
}

/**
 * Checks whether a proactive nudge should be presented based on governance rules:
 * - Must not be open
 * - Must not have had direct user interaction in current session
 * - Must not have been dismissed in the current session
 * - Must not have exceeded the per-session frequency cap
 */
export function canShowProactiveNudge(params: NudgeEligibilityParams): boolean {
  const {
    isOpen,
    hasInteracted = false,
    sessionStorage,
    configEnabled = PROACTIVE_TRIGGER_CONFIG.enabled
  } = params;

  if (!configEnabled) return false;
  if (isOpen) return false;
  if (hasInteracted) return false;

  if (sessionStorage) {
    try {
      if (sessionStorage.getItem(NUDGE_STORAGE_KEYS.SESSION_DISMISSED)) {
        return false;
      }
      if (sessionStorage.getItem(NUDGE_STORAGE_KEYS.SESSION_SHOWN)) {
        return false;
      }
    } catch {
      // Storage access blocked or restricted
    }
  }

  return true;
}

/**
 * Marks the proactive nudge as dismissed for the remainder of the browsing session.
 */
export function markNudgeDismissed(sessionStorage?: Storage | null): void {
  if (!sessionStorage) return;
  try {
    sessionStorage.setItem(NUDGE_STORAGE_KEYS.SESSION_DISMISSED, 'true');
  } catch {
    // Graceful storage failure
  }
}

/**
 * Marks that a proactive nudge has been presented in this session (frequency cap: 1).
 */
export function markNudgeShown(sessionStorage?: Storage | null): void {
  if (!sessionStorage) return;
  try {
    sessionStorage.setItem(NUDGE_STORAGE_KEYS.SESSION_SHOWN, 'true');
  } catch {
    // Graceful storage failure
  }
}

/**
 * Tracks visitor sessions in local storage to identify return visitors.
 */
export function recordVisitorSession(localStorage?: Storage | null): {
  visitCount: number;
  isReturning: boolean;
  profile: VisitorProfile;
} {
  const defaultProfile: VisitorProfile = {
    visitCount: 1,
    firstVisit: new Date().toISOString(),
    lastVisit: new Date().toISOString()
  };

  if (!localStorage) {
    return { visitCount: 1, isReturning: false, profile: defaultProfile };
  }

  try {
    const raw = localStorage.getItem(NUDGE_STORAGE_KEYS.VISITOR_PROFILE);
    if (!raw) {
      localStorage.setItem(NUDGE_STORAGE_KEYS.VISITOR_PROFILE, JSON.stringify(defaultProfile));
      return { visitCount: 1, isReturning: false, profile: defaultProfile };
    }

    const existing: VisitorProfile = JSON.parse(raw);
    const updated: VisitorProfile = {
      visitCount: (existing.visitCount || 1) + 1,
      firstVisit: existing.firstVisit || new Date().toISOString(),
      lastVisit: new Date().toISOString()
    };

    localStorage.setItem(NUDGE_STORAGE_KEYS.VISITOR_PROFILE, JSON.stringify(updated));
    return {
      visitCount: updated.visitCount,
      isReturning: updated.visitCount > 1,
      profile: updated
    };
  } catch {
    return { visitCount: 1, isReturning: false, profile: defaultProfile };
  }
}

export interface NudgeMessageContent {
  badge: string;
  title: string;
  body: string;
  cta: string;
}

/**
 * Retrieves the trilingual localized nudge content based on trigger type.
 */
export function getNudgeMessage(
  triggerType: NudgeTriggerType,
  lang: 'id' | 'en' | 'ko' = 'id'
): NudgeMessageContent {
  const messages = PROACTIVE_TRIGGER_CONFIG.messages[triggerType];
  if (!messages) {
    return PROACTIVE_TRIGGER_CONFIG.messages.dwell_time[lang] || PROACTIVE_TRIGGER_CONFIG.messages.dwell_time.en;
  }
  return messages[lang] || messages.en;
}
