import crypto from 'crypto';

/**
 * Normalizes an external URL into a canonical, tracking-free form
 */
export function normalizeCanonicalUrl(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl.trim());

    // Normalize protocol and hostname
    parsed.protocol = parsed.protocol.toLowerCase();
    parsed.hostname = parsed.hostname.toLowerCase();

    // Strip common tracking and session parameters
    const trackingParams = [
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_term',
      'utm_content',
      'ref',
      'ref_src',
      'source',
      'fbclid',
      'gclid',
      '_ga',
      'msclkid',
    ];
    for (const param of trackingParams) {
      parsed.searchParams.delete(param);
    }

    // Strip anchor fragments
    parsed.hash = '';

    // Strip redundant trailing slash from pathname if length > 1
    if (parsed.pathname.length > 1 && parsed.pathname.endsWith('/')) {
      parsed.pathname = parsed.pathname.slice(0, -1);
    }

    // Normalize GitHub release URLs to canonical tag URLs
    if (parsed.hostname === 'github.com') {
      parsed.pathname = parsed.pathname.replace(/\/releases\/tag\//, '/releases/tag/');
    }

    return parsed.toString();
  } catch {
    // If not a valid URL string, sanitize basic whitespace
    return rawUrl.trim().replace(/\s+/g, '');
  }
}

/**
 * Normalizes any date format into a valid ISO 8601 UTC timestamp
 */
export function normalizeTimestamp(rawDate: string | number | Date | undefined): string {
  if (!rawDate) return new Date().toISOString();

  try {
    let dateObj: Date;
    if (typeof rawDate === 'number') {
      // Handle unix timestamp in seconds vs milliseconds
      dateObj = new Date(rawDate < 1e11 ? rawDate * 1000 : rawDate);
    } else if (rawDate instanceof Date) {
      dateObj = rawDate;
    } else {
      dateObj = new Date(String(rawDate).trim());
    }

    if (isNaN(dateObj.getTime())) {
      return new Date().toISOString();
    }

    // Prevent absurd future dates beyond 1 day
    const oneDayFromNow = Date.now() + 86400000;
    if (dateObj.getTime() > oneDayFromNow) {
      return new Date().toISOString();
    }

    return dateObj.toISOString();
  } catch {
    return new Date().toISOString();
  }
}

/**
 * Generates deterministic SHA-256 content fingerprint
 */
export function generateContentHash(
  source: string,
  canonicalUrl: string,
  title: string
): string {
  const normSource = source.toLowerCase().trim();
  const normUrl = canonicalUrl.toLowerCase().trim();
  const normTitle = title.toLowerCase().trim().replace(/[^a-z0-9]/g, '');

  const payload = `${normSource}:${normUrl}:${normTitle}`;
  return crypto.createHash('sha256').update(payload).digest('hex');
}

/**
 * Strips raw HTML comments, badges, and control characters from technical text
 */
export function cleanTextContent(raw: string): string {
  if (!raw) return '';

  return raw
    // Remove HTML comments
    .replace(/<!--[\s\S]*?-->/g, '')
    // Remove Markdown badges: [![...](...)](...)
    .replace(/\[!\[.*?\]\(.*?\)\]\(.*?\)/g, '')
    // Remove standalone image tags: ![...](...)
    .replace(/!\[.*?\]\(.*?\)/g, '')
    // Remove markdown links: [text](url) -> text
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    // Remove bold/italic markers
    .replace(/[*_~`#]/g, '')
    // Collapse excess whitespace
    .replace(/\s+/g, ' ')
    .trim();
}
