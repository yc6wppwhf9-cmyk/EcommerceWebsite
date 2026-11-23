// Context sent with each "Buy on <marketplace>" click for the admin click
// report: which page the click came from, how the visitor arrived (campaign),
// the device type and an anonymous per-visit session id. Nothing personal is
// collected; the session id is random and lasts only for the browser tab.

const SESSION_KEY = 'pbsid'; // shared with the product page's live view counter
const CAMPAIGN_KEY = 'pb_campaign';

export function getSessionId(): string {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return '';
  }
}

/** Run once on page load, before routing can drop the query string. */
export function captureCampaign() {
  try {
    if (sessionStorage.getItem(CAMPAIGN_KEY) !== null) return;
    const q = new URLSearchParams(location.search);
    const utm = ['utm_source', 'utm_medium', 'utm_campaign']
      .map((k) => q.get(k))
      .filter(Boolean)
      .join(' / ');
    let campaign = utm;
    if (!campaign && q.get('gclid')) campaign = 'google / cpc';
    if (!campaign && q.get('fbclid')) campaign = 'facebook / social';
    if (!campaign && document.referrer) {
      const host = new URL(document.referrer).hostname.replace(/^www\./, '');
      if (host && !host.endsWith('prioritybags.in')) campaign = `${host} / referral`;
    }
    sessionStorage.setItem(CAMPAIGN_KEY, campaign || 'direct');
  } catch { /* storage blocked */ }
}

export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  const ua = navigator.userAgent || '';
  if (/iPad|Tablet|PlayBook|Silk/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua))) return 'tablet';
  if (/Mobi|iPhone|iPod|Android|BlackBerry|Opera Mini|IEMobile/i.test(ua)) return 'mobile';
  return 'desktop';
}

export function clickContext(): Record<string, string> {
  let campaign = '';
  try { campaign = sessionStorage.getItem(CAMPAIGN_KEY) || ''; } catch { /* storage blocked */ }
  return {
    page: location.pathname.slice(0, 200),
    campaign: campaign.slice(0, 120),
    device: getDeviceType(),
    sid: getSessionId(),
  };
}
