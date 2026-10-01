/**
 * INPARTNER AI — Marketing Attribution & UTM Campaign Telemetry Engine
 * PT Inpartner Optima Integra • Multi-Touch Acquisition Intelligence
 */

import type { AttributionData } from './db.ts';

export const ATTRIBUTION_STORAGE_KEY = 'inpartner_marketing_attribution';

/**
 * Extracts standard UTM and referrer query parameters from a URL or query string.
 */
export function parseUtmParameters(urlOrSearch: string = ''): Partial<AttributionData> {
  const result: Partial<AttributionData> = {};
  if (!urlOrSearch) return result;

  try {
    let search = urlOrSearch;
    if (urlOrSearch.includes('?')) {
      search = urlOrSearch.split('?')[1] || '';
      // Strip any hash fragments from the search query
      if (search.includes('#')) {
        search = search.split('#')[0] || '';
      }
    } else if (urlOrSearch.includes('#') && urlOrSearch.includes('=')) {
      search = urlOrSearch.split('#')[1] || '';
    }

    const params = new URLSearchParams(search);

    const source = params.get('utm_source');
    const medium = params.get('utm_medium');
    const campaign = params.get('utm_campaign');
    const term = params.get('utm_term');
    const content = params.get('utm_content');

    if (source && source.trim()) result.utm_source = source.trim().toLowerCase();
    if (medium && medium.trim()) result.utm_medium = medium.trim().toLowerCase();
    if (campaign && campaign.trim()) result.utm_campaign = campaign.trim();
    if (term && term.trim()) result.utm_term = term.trim();
    if (content && content.trim()) result.utm_content = content.trim();
  } catch {
    // Graceful fallback on malformed query strings
  }

  return result;
}

/**
 * Captures marketing attribution from browser environment, respecting first-touch persistence.
 */
export function captureMarketingAttribution(
  currentUrl?: string,
  referrerUrl?: string,
  storage?: Storage | null
): AttributionData {
  // 1. Check storage first to preserve first-touch campaign attribution
  if (storage) {
    try {
      const existingRaw = storage.getItem(ATTRIBUTION_STORAGE_KEY);
      if (existingRaw) {
        const existing: AttributionData = JSON.parse(existingRaw);
        if (existing.utm_source || existing.utm_campaign) {
          return existing;
        }
      }
    } catch {
      // Storage read fallback
    }
  }

  const url = currentUrl || (typeof window !== 'undefined' ? window.location.href : '');
  const referrer = referrerUrl || (typeof document !== 'undefined' ? document.referrer : '');

  const utmData = parseUtmParameters(url);
  const landingPage = url ? url.split('#')[0] : '';

  // Determine organic search or social referrer if UTM parameters are absent
  let derivedSource = utmData.utm_source;
  let derivedMedium = utmData.utm_medium;

  if (!derivedSource && referrer) {
    try {
      const refHost = new URL(referrer).hostname.toLowerCase();
      if (refHost.includes('google.')) {
        derivedSource = 'google';
        derivedMedium = 'organic';
      } else if (refHost.includes('linkedin.')) {
        derivedSource = 'linkedin';
        derivedMedium = 'social';
      } else if (refHost.includes('facebook.') || refHost.includes('instagram.')) {
        derivedSource = 'meta';
        derivedMedium = 'social';
      } else if (refHost.includes('t.co') || refHost.includes('twitter.') || refHost.includes('x.com')) {
        derivedSource = 'x_twitter';
        derivedMedium = 'social';
      } else {
        derivedSource = refHost;
        derivedMedium = 'referral';
      }
    } catch {
      derivedSource = referrer.slice(0, 100);
      derivedMedium = 'referral';
    }
  }

  const captured: AttributionData = {
    utm_source: derivedSource || 'direct',
    utm_medium: derivedMedium || 'none',
    utm_campaign: utmData.utm_campaign,
    utm_term: utmData.utm_term,
    utm_content: utmData.utm_content,
    referrer_url: referrer || undefined,
    landing_page: landingPage || undefined,
    captured_at: new Date().toISOString()
  };

  if (storage) {
    try {
      storage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(captured));
    } catch {
      // Storage write fallback
    }
  }

  return captured;
}

/**
 * Retrieves persisted marketing attribution from storage if available.
 */
export function getPersistedAttribution(storage?: Storage | null): AttributionData | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(ATTRIBUTION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Returns a human-readable channel badge string (e.g. "google / cpc", "linkedin / social", "direct").
 */
export function formatAttributionBadge(attribution?: AttributionData): string {
  if (!attribution || (!attribution.utm_source && !attribution.utm_campaign)) {
    return 'Direct';
  }

  const source = attribution.utm_source || 'direct';
  if (source === 'direct' && (!attribution.utm_medium || attribution.utm_medium === 'none')) {
    return 'direct';
  }

  const medium = attribution.utm_medium && attribution.utm_medium !== 'none' ? ` / ${attribution.utm_medium}` : '';
  return `${source}${medium}`;
}

/**
 * Returns full visual badge styling configuration for UI widgets.
 */
export function getAttributionBadgeInfo(attribution?: AttributionData): {
  channelLabel: string;
  campaignLabel: string;
  sourceText: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
} {
  if (!attribution || (!attribution.utm_source && !attribution.utm_campaign)) {
    return {
      channelLabel: 'Direct Traffic',
      campaignLabel: 'Organic Inbound',
      sourceText: 'Direct Inbound',
      badgeBg: 'bg-slate-50',
      badgeText: 'text-slate-700',
      badgeBorder: 'border-slate-200'
    };
  }

  const source = attribution.utm_source || 'direct';
  const medium = attribution.utm_medium && attribution.utm_medium !== 'none' ? ` / ${attribution.utm_medium}` : '';
  const campaign = attribution.utm_campaign || 'General Acquisition';

  let badgeBg = 'bg-sky-50';
  let badgeText = 'text-sky-800';
  let badgeBorder = 'border-sky-200';

  if (source.includes('linkedin')) {
    badgeBg = 'bg-blue-50';
    badgeText = 'text-blue-800';
    badgeBorder = 'border-blue-200';
  } else if (source.includes('google')) {
    badgeBg = 'bg-emerald-50';
    badgeText = 'text-emerald-800';
    badgeBorder = 'border-emerald-200';
  } else if (source.includes('partner') || source.includes('referral')) {
    badgeBg = 'bg-purple-50';
    badgeText = 'text-purple-800';
    badgeBorder = 'border-purple-200';
  }

  return {
    channelLabel: `${source}${medium}`,
    campaignLabel: campaign,
    sourceText: `${source}${medium} (${campaign})`,
    badgeBg,
    badgeText,
    badgeBorder
  };
}
